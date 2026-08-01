// useSleepTracker.ts — ردیابی خواب با DeviceMotion + IndexedDB + WakeLock
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ===================== Types =====================
export interface MovementSpike {
  timestamp: number;
  magnitude: number;
}

export interface SleepSession {
  id: string;
  startTime: number;
  endTime: number;
  spikes: MovementSpike[];
  efficiency: number; // persisted movement-calmness index (legacy field name), 0-100
}

export interface HourlyBucket {
  hour: string; // "00", "01", ...
  movement: number; // average magnitude in that hour
  label: string; // "۰۰:۰۰" farsi
}

// ===================== IndexedDB helpers =====================
const DB_NAME = "bekhab-sleep";
const DB_VERSION = 1;
const STORE_NAME = "sessions";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveSession(session: SleepSession): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(session);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getLatestSession(): Promise<SleepSession | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const all = request.result as SleepSession[];
      if (all.length === 0) return resolve(null);
      all.sort((a, b) => b.startTime - a.startTime);
      resolve(all[0]);
    };
    request.onerror = () => reject(request.error);
  });
}

async function getAllSessions(): Promise<SleepSession[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as SleepSession[]);
    request.onerror = () => reject(request.error);
  });
}

// ===================== Movement threshold =====================
const SPIKE_THRESHOLD = 1.5; // m/s² above baseline gravity
const MIN_SESSION_DURATION_MS = 60_000;
const MAX_AVERAGE_SAMPLE_INTERVAL_MS = 5_000;

function computeMagnitude(x: number, y: number, z: number): number {
  // Remove gravity (~9.81) — use accelerationIncludingGravity and subtract
  return Math.sqrt(x * x + y * y + z * z) - 9.81;
}

// ===================== Movement calmness =====================
function calculateMovementScore(spikes: MovementSpike[], durationMs: number): number {
  if (durationMs <= 0) return 0;
  const durationMinutes = durationMs / 60000;
  // Fewer spikes per minute = calmer movement score
  const spikesPerMinute = spikes.length / durationMinutes;
  // Scale: 0 spikes/min = 100%, 5+ spikes/min = 0%
  const raw = Math.max(0, 100 - spikesPerMinute * 20);
  return Math.round(Math.min(100, raw));
}

// ===================== Hourly buckets for bar chart =====================
export function buildHourlyBuckets(session: SleepSession): HourlyBucket[] {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const toFa = (n: number) =>
    n.toString().padStart(2, "0").replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);

  const startHour = new Date(session.startTime);
  startHour.setMinutes(0, 0, 0);
  const endHour = new Date(session.endTime);
  endHour.setMinutes(0, 0, 0);
  const elapsedHours = Math.floor((endHour.getTime() - startHour.getTime()) / 3_600_000);
  const bucketCount = Math.min(24, Math.max(1, elapsedHours + 1));
  const hours = Array.from(
    { length: bucketCount },
    (_, index) => (startHour.getHours() + index) % 24,
  );

  return hours.map((hour) => {
    const matching = session.spikes.filter((s) => new Date(s.timestamp).getHours() === hour);
    const avgMag =
      matching.length > 0
        ? matching.reduce((sum, s) => sum + s.magnitude, 0) / matching.length
        : 0;
    return {
      hour: hour.toString().padStart(2, "0"),
      movement: Math.round(avgMag * 100) / 100,
      label: `${toFa(hour)}:۰۰`,
    };
  });
}

// ===================== Hook =====================
export function useSleepTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [lastSession, setLastSession] = useState<SleepSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  const spikesRef = useRef<MovementSpike[]>([]);
  const motionSamplesRef = useRef(0);
  const startTimeRef = useRef<number>(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Load latest session on mount
  useEffect(() => {
    getLatestSession().then(setLastSession).catch(() => {});
  }, []);

  // Request WakeLock
  const requestWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      }
    } catch {
      // WakeLock not supported or denied — non-critical
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    const wakeLock = wakeLockRef.current;
    wakeLockRef.current = null;
    if (!wakeLock) return;
    try {
      void wakeLock.release().catch(() => {});
    } catch {
      // WakeLock cleanup is best-effort and must not interrupt session persistence.
    }
  }, []);

  // Start tracking
  const startTracking = useCallback(async () => {
    spikesRef.current = [];
    motionSamplesRef.current = 0;
    startTimeRef.current = Date.now();
    setIsTracking(true);
    setError(null);

    // Request wake lock
    await requestWakeLock();

    // Check for DeviceMotion support
    if (typeof window === "undefined" || !("DeviceMotionEvent" in window)) {
      setError("سنسور حرکت در این دستگاه پشتیبانی نمی‌شود");
      setIsTracking(false);
      releaseWakeLock();
      return;
    }

    // iOS 13+ requires permission
    const DME = DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (typeof DME.requestPermission === "function") {
      try {
        const perm = await DME.requestPermission();
        if (perm !== "granted") {
          setError("دسترسی به سنسور حرکت رد شد");
          setIsTracking(false);
          releaseWakeLock();
          return;
        }
      } catch {
        setError("خطا در درخواست دسترسی سنسور");
        setIsTracking(false);
        releaseWakeLock();
        return;
      }
    }

    const handler = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x == null || acc.y == null || acc.z == null) return;

      motionSamplesRef.current += 1;
      const magnitude = Math.abs(computeMagnitude(acc.x, acc.y, acc.z));
      if (magnitude > SPIKE_THRESHOLD) {
        spikesRef.current.push({
          timestamp: Date.now(),
          magnitude,
        });
      }
    };

    window.addEventListener("devicemotion", handler);

    // Store cleanup reference
    (window as unknown as Record<string, unknown>).__bekhabMotionHandler = handler;
  }, [releaseWakeLock, requestWakeLock]);

  // Stop tracking and save session
  const stopTracking = useCallback(async () => {
    setIsTracking(false);
    releaseWakeLock();

    // Remove listener
    const handler = (window as unknown as Record<string, unknown>).__bekhabMotionHandler as
      | EventListener
      | undefined;
    if (handler) {
      window.removeEventListener("devicemotion", handler);
      delete (window as unknown as Record<string, unknown>).__bekhabMotionHandler;
    }

    const endTime = Date.now();
    const duration = endTime - startTimeRef.current;
    if (motionSamplesRef.current === 0) {
      setError("هیچ داده‌ای از سنسور حرکت دریافت نشد");
      return false;
    }
    if (duration < MIN_SESSION_DURATION_MS) {
      setError("برای محاسبه شاخص، دست‌کم یک دقیقه داده لازم است");
      return false;
    }
    const minimumSamples = Math.ceil(duration / MAX_AVERAGE_SAMPLE_INTERVAL_MS);
    if (motionSamplesRef.current < minimumSamples) {
      setError("داده سنسور برای محاسبه شاخص کافی نبود");
      return false;
    }
    const efficiency = calculateMovementScore(spikesRef.current, duration);

    const session: SleepSession = {
      id: `session_${startTimeRef.current}`,
      startTime: startTimeRef.current,
      endTime,
      spikes: spikesRef.current,
      efficiency,
    };

    try {
      await saveSession(session);
      setLastSession(session);
      return true;
    } catch {
      setError("خطا در ذخیره‌سازی اطلاعات خواب");
      return false;
    }
  }, [releaseWakeLock]);

  useEffect(() => {
    if (!isTracking) return;

    let navigationPending = false;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (navigationPending) return;
      event.preventDefault();
      event.returnValue = true;
    };
    const saveBeforeNavigation = (event: MouseEvent) => {
      if (
        navigationPending ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);
      const changesDocument =
        destination.origin !== current.origin ||
        destination.pathname !== current.pathname ||
        destination.search !== current.search;
      if (!changesDocument) return;

      event.preventDefault();
      navigationPending = true;
      void stopTracking().then((saved) => {
        if (saved) {
          window.location.assign(destination.href);
        } else {
          navigationPending = false;
        }
      });
    };

    window.addEventListener("beforeunload", warnBeforeUnload);
    document.addEventListener("click", saveBeforeNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
      document.removeEventListener("click", saveBeforeNavigation, true);
    };
  }, [isTracking, stopTracking]);

  // Load all sessions
  const loadAllSessions = useCallback(async () => {
    return getAllSessions();
  }, []);

  useEffect(() => {
    return () => {
      releaseWakeLock();
      const handler = (window as unknown as Record<string, unknown>).__bekhabMotionHandler as
        | EventListener
        | undefined;
      if (handler) {
        window.removeEventListener("devicemotion", handler);
        delete (window as unknown as Record<string, unknown>).__bekhabMotionHandler;
      }
    };
  }, [releaseWakeLock]);

  return {
    isTracking,
    lastSession,
    error,
    startTracking,
    stopTracking,
    loadAllSessions,
  };
}
