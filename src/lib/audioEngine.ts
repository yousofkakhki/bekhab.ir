// audioEngine.ts — موتور صدای سینگلتون (یک نمونه مشترک برای کل برنامه)
// چرا سینگلتون: قبلاً هر کامپوننتی که useAudioMixer صدا می‌زد، AudioContext
// مستقل خودش را می‌ساخت → پخش دوتایی و ناهماهنگی play/pause. اینجا همه‌چیز
// در یک ماژول مشترک نگه‌داری می‌شود.
//
// پخش در پس‌زمینه (Chrome Android): خروجی میکسر از طریق
// MediaStreamAudioDestinationNode به یک <audio> هدایت می‌شود و MediaSession
// ست می‌شود تا سیستم‌عامل صدا را زنده نگه دارد و کنترل‌های صفحه‌قفل نشان دهد.
"use client";

import { useAudioStore } from "@/store/audioStore";
import { SOUNDS } from "@/lib/sound-config";

interface TrackNode {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

const FADE_TIME = 0.05; // ثانیه — جلوگیری از کلیک/پاپ

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let streamDest: MediaStreamAudioDestinationNode | null = null;
let keepAliveEl: HTMLAudioElement | null = null;
let usingStreamOutput = false;
let mediaSessionReady = false;

const tracks = new Map<string, TrackNode>();
const buffers = new Map<string, AudioBuffer>();
const pending = new Set<string>(); // در حال بارگذاری — جلوگیری از start همزمان
let desiredSounds = new Set<string>();

// ===================== AudioContext (lazy, singleton) =====================
function ensureContext(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();

    // مسیر خروجی: ترجیحاً از طریق MediaStream + <audio> برای پخش پس‌زمینه.
    try {
      streamDest = ctx.createMediaStreamDestination();
      masterGain.connect(streamDest);
      keepAliveEl = new Audio();
      keepAliveEl.srcObject = streamDest.stream;
      keepAliveEl.loop = true;
      // در گوشی اگر سیستم اجازه دهد، همین المان صدا را در پس‌زمینه نگه می‌دارد
      void keepAliveEl.play().catch(() => {});
      usingStreamOutput = true;
    } catch {
      // فالبک: خروجی مستقیم به بلندگو (بدون پشتیبانی پس‌زمینه)
      usingStreamOutput = false;
    }

    if (!usingStreamOutput) {
      masterGain.connect(ctx.destination);
    }

    setupMediaSession();
  }
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => {});
  }
  if (usingStreamOutput && keepAliveEl?.paused) {
    void keepAliveEl.play().catch(() => {});
  }
  return ctx;
}

// ===================== MediaSession =====================
function setupMediaSession() {
  if (mediaSessionReady) return;
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;

  try {
    navigator.mediaSession.setActionHandler("play", () => resume());
    navigator.mediaSession.setActionHandler("pause", () => suspend());
    navigator.mediaSession.setActionHandler("stop", () => stopEverything());
    mediaSessionReady = true;
  } catch {
    // برخی مرورگرها همه‌ی اکشن‌ها را پشتیبانی نمی‌کنند
  }
}

function updateMediaSession() {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  const count = tracks.size;
  try {
    if (count > 0 && "MediaMetadata" in window) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: "بِخواب",
        artist: `${count} صدای فعال`,
        album: "صداهای آرامش‌بخش",
        artwork: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      });
    }
    navigator.mediaSession.playbackState =
      count > 0 && ctx?.state === "running" ? "playing" : "paused";
  } catch {
    // noop
  }
}

// ===================== Fetch + Decode =====================
async function loadBuffer(soundId: string, src: string): Promise<AudioBuffer | null> {
  const cached = buffers.get(soundId);
  if (cached) return cached;
  try {
    const audioCtx = ensureContext();
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const arr = await res.arrayBuffer();
    const buf = await audioCtx.decodeAudioData(arr);
    buffers.set(soundId, buf);
    return buf;
  } catch {
    console.warn(`[bekhab] Failed to load sound: ${soundId} (${src})`);
    return null;
  }
}

// ===================== Start / Stop =====================
export async function startTrack(
  soundId: string,
  src: string,
  volume: number
): Promise<boolean> {
  if (tracks.has(soundId) || pending.has(soundId)) return true;
  pending.add(soundId);
  try {
    const buf = await loadBuffer(soundId, src);
    if (!buf) {
      useAudioStore.getState().failSound(soundId);
      return false;
    }
    if (!masterGain || !ctx || !desiredSounds.has(soundId)) return false;
    if (tracks.has(soundId)) return true; // در این فاصله اضافه شده

    const source = ctx.createBufferSource();
    source.buffer = buf;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + FADE_TIME);

    source.connect(gain);
    gain.connect(masterGain);
    source.start(0);

    tracks.set(soundId, { source, gain });
    updateMediaSession();
    return true;
  } finally {
    pending.delete(soundId);
  }
}

export function stopTrack(soundId: string) {
  const track = tracks.get(soundId);
  if (!track) return;
  tracks.delete(soundId);

  if (ctx) {
    track.gain.gain.setValueAtTime(track.gain.gain.value, ctx.currentTime);
    track.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_TIME);
    setTimeout(() => {
      try {
        track.source.stop();
      } catch {
        // already stopped
      }
      track.source.disconnect();
      track.gain.disconnect();
    }, FADE_TIME * 1000 + 10);
  } else {
    try {
      track.source.stop();
    } catch {}
    track.source.disconnect();
    track.gain.disconnect();
  }
  updateMediaSession();
}

export function setTrackVolume(soundId: string, volume: number) {
  const track = tracks.get(soundId);
  if (track && ctx) {
    track.gain.gain.setValueAtTime(track.gain.gain.value, ctx.currentTime);
    track.gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + FADE_TIME);
  }
}

export function suspend() {
  void ctx?.suspend().catch(() => {});
  useAudioStore.getState().setGlobalPlaying(false);
  updateMediaSession();
}

export function resume() {
  ensureContext();
  void ctx?.resume().catch(() => {});
  if (usingStreamOutput && keepAliveEl?.paused) {
    void keepAliveEl.play().catch(() => {});
  }
  useAudioStore.getState().setGlobalPlaying(true);
  updateMediaSession();
}

export function stopAllTracks() {
  Array.from(tracks.keys()).forEach((id) => stopTrack(id));
}

/** توقف کامل: همه‌ی صداها + پاک‌سازی state (حجم‌ها حفظ می‌شوند). */
export function stopEverything() {
  stopAllTracks();
  useAudioStore.getState().clearAll();
  updateMediaSession();
}

/** آشتی‌دادن موتور با state فروشگاه — تنها منبع حقیقت. */
export function reconcile(
  activeSounds: Map<string, string>,
  volumes: Record<string, number>,
  isGlobalPlaying: boolean
) {
  desiredSounds = isGlobalPlaying
    ? new Set(activeSounds.keys())
    : new Set<string>();

  // همیشه صداهای حذف‌شده را متوقف کن (حتی اگر isGlobalPlaying=false شده باشد)
  Array.from(tracks.keys()).forEach((soundId) => {
    if (!activeSounds.has(soundId)) stopTrack(soundId);
  });

  // فقط وقتی در حال پخش هستیم صداهای فعال را شروع کن
  if (isGlobalPlaying) {
    activeSounds.forEach((src, soundId) => {
      const vol =
        volumes[soundId] ?? SOUNDS.find((s) => s.id === soundId)?.defaultVolume ?? 0.5;
      void startTrack(soundId, src, vol);
    });
  }
}

/** فقط برای تست/دیباگ. */
export function _engineState() {
  return {
    hasContext: !!ctx,
    state: ctx?.state ?? "none",
    trackCount: tracks.size,
    usingStreamOutput,
  };
}
