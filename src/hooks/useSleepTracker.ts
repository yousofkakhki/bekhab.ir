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
  sampleCount: number;
  maxSampleGap: number;
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
      const all = request.result.filter(isVerifiedSession);
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
    request.onsuccess = () => resolve(request.result.filter(isVerifiedSession));
    request.onerror = () => reject(request.error);
  });
}

// ===================== Movement threshold =====================
const SPIKE_THRESHOLD = 1.5; // m/s² above baseline gravity
const MIN_SESSION_DURATION_MS = 60_000;
const MAX_AVERAGE_SAMPLE_INTERVAL_MS = 5_000;
const MAX_SAMPLE_GAP_MS = 10_000;

function isVerifiedSession(value: unknown): value is SleepSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<SleepSession>;
  if (
    typeof session.id !== "string" ||
    !Number.isFinite(session.startTime) ||
    !Number.isFinite(session.endTime) ||
    !Number.isFinite(session.efficiency) ||
    !Number.isFinite(session.maxSampleGap) ||
    !Number.isInteger(session.sampleCount) ||
    !Array.isArray(session.spikes)
  ) {
    return false;
  }

  const duration = session.endTime! - session.startTime!;
  const minimumSamples = Math.ceil(duration / MAX_AVERAGE_SAMPLE_INTERVAL_MS);
  return (
    duration >= MIN_SESSION_DURATION_MS &&
    session.efficiency! >= 0 &&
    session.efficiency! <= 100 &&
    session.sampleCount! >= minimumSamples &&
    session.maxSampleGap! >= 0 &&
    session.maxSampleGap! <= MAX_SAMPLE_GAP_MS &&
    session.spikes.length <= session.sampleCount! &&
    session.spikes.every(
      (spike) =>
        spike &&
        Number.isFinite(spike.timestamp) &&
        Number.isFinite(spike.magnitude) &&
        spike.timestamp >= session.startTime! &&
        spike.timestamp <= session.endTime!,
    )
  );
}

function safelyReleaseWakeLock(wakeLock: WakeLockSentinel | null): void {
  if (!wakeLock) return;
  try {
    void wakeLock.release().catch(() => {});
  } catch {
    // WakeLock cleanup is best-effort and must not interrupt session persistence.
  }
}

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
  const lastSampleTimeRef = useRef<number>(0);
  const maxSampleGapRef = useRef(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const motionHandlerRef = useRef<((event: DeviceMotionEvent) => void) | null>(null);
  const trackingRunRef = useRef(0);

  // Load latest session on mount
  useEffect(() => {
    getLatestSession().then(setLastSession).catch(() => {});
  }, []);

  // Request WakeLock
  const requestWakeLock = useCallback(async () => {
    try {
      if ("wakeLock" in navigator) {
        return await navigator.wakeLock.request("screen");
      }
    } catch {
      // WakeLock not supported or denied — non-critical
    }
    return null;
  }, []);

  const releaseWakeLock = useCallback(() => {
    const wakeLock = wakeLockRef.current;
    wakeLockRef.current = null;
    safelyReleaseWakeLock(wakeLock);
  }, []);

  const removeMotionListener = useCallback(() => {
    const handler = motionHandlerRef.current;
    motionHandlerRef.current = null;
    if (handler) {
      window.removeEventListener("devicemotion", handler);
    }
    delete (window as unknown as Record<string, unknown>).__bekhabMotionReady;
  }, []);

  // Start tracking
  const startTracking = useCallback(async () => {
    const runId = trackingRunRef.current + 1;
    trackingRunRef.current = runId;
    removeMotionListener();
    releaseWakeLock();
    spikesRef.current = [];
    motionSamplesRef.current = 0;
    startTimeRef.current = 0;
    lastSampleTimeRef.current = 0;
    maxSampleGapRef.current = 0;
    setIsTracking(true);
    setError(null);

    // Request wake lock
    const wakeLock = await requestWakeLock();
    if (trackingRunRef.current !== runId) {
      safelyReleaseWakeLock(wakeLock);
      return;
    }
    wakeLockRef.current = wakeLock;

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
        if (trackingRunRef.current !== runId) {
          if (wakeLockRef.current === wakeLock) releaseWakeLock();
          return;
        }
        if (perm !== "granted") {
          setError("دسترسی به سنسور حرکت رد شد");
          setIsTracking(false);
          releaseWakeLock();
          return;
        }
      } catch {
        if (trackingRunRef.current !== runId) {
          if (wakeLockRef.current === wakeLock) releaseWakeLock();
          return;
        }
        setError("خطا در درخواست دسترسی سنسور");
        setIsTracking(false);
        releaseWakeLock();
        return;
      }
    }

    const handler = (event: DeviceMotionEvent) => {
      if (trackingRunRef.current !== runId) return;
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x == null || acc.y == null || acc.z == null) return;

      const sampleTime = Date.now();
      maxSampleGapRef.current = Math.max(
        maxSampleGapRef.current,
        sampleTime - lastSampleTimeRef.current,
      );
      lastSampleTimeRef.current = sampleTime;
      motionSamplesRef.current += 1;
      const magnitude = Math.abs(computeMagnitude(acc.x, acc.y, acc.z));
      if (magnitude > SPIKE_THRESHOLD) {
        spikesRef.current.push({
          timestamp: sampleTime,
          magnitude,
        });
      }
    };

    if (trackingRunRef.current !== runId) return;
    startTimeRef.current = Date.now();
    lastSampleTimeRef.current = startTimeRef.current;
    motionHandlerRef.current = handler;
    window.addEventListener("devicemotion", handler);

    // Expose only a boolean readiness marker for browser diagnostics and tests.
    (window as unknown as Record<string, unknown>).__bekhabMotionReady = true;
  }, [releaseWakeLock, removeMotionListener, requestWakeLock]);

  // Stop tracking and save session
  const stopTracking = useCallback(async () => {
    trackingRunRef.current += 1;
    setIsTracking(false);
    releaseWakeLock();
    removeMotionListener();

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
    const maxSampleGap = Math.max(
      maxSampleGapRef.current,
      endTime - lastSampleTimeRef.current,
    );
    if (
      motionSamplesRef.current < minimumSamples ||
      maxSampleGap > MAX_SAMPLE_GAP_MS
    ) {
      setError("داده سنسور برای محاسبه شاخص کافی نبود");
      return false;
    }
    const efficiency = calculateMovementScore(spikesRef.current, duration);

    const session: SleepSession = {
      id: `session_${startTimeRef.current}`,
      startTime: startTimeRef.current,
      endTime,
      spikes: spikesRef.current,
      sampleCount: motionSamplesRef.current,
      maxSampleGap,
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
  }, [releaseWakeLock, removeMotionListener]);

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
      trackingRunRef.current += 1;
      releaseWakeLock();
      removeMotionListener();
    };
  }, [releaseWakeLock, removeMotionListener]);

  return {
    isTracking,
    lastSession,
    error,
    startTracking,
    stopTracking,
    loadAllSessions,
  };
}
