// useAudioMixer.ts — موتور صدای Web Audio API
// پخش بدون‌وقفه (gapless) + میکس چند‌تِرَکی با GainNode مستقل

"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAudioStore } from "@/store/audioStore";

/**
 * هر ترک صدا شامل:
 * — AudioBufferSourceNode (لوپ بدون‌وقفه)
 * — GainNode (کنترل حجم مستقل)
 * — AudioBuffer (دیکد‌شده)
 */
interface TrackNode {
  source: AudioBufferSourceNode;
  gain: GainNode;
  buffer: AudioBuffer;
}

// Crossfade رمپ (ثانیه) — جلوگیری از کلیک/پاپ
const FADE_TIME = 0.05;

export function useAudioMixer() {
  const ctxRef = useRef<AudioContext | null>(null);
  const tracksRef = useRef<Map<string, TrackNode>>(new Map());
  const buffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const masterGainRef = useRef<GainNode | null>(null);

  const {
    activeSounds,
    volumes,
    isGlobalPlaying,
    toggleSound,
    setVolume,
    setGlobalPlaying,
  } = useAudioStore();

  // ===================== AudioContext (lazy init) =====================
  const getContext = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
      masterGainRef.current = ctxRef.current.createGain();
      masterGainRef.current.connect(ctxRef.current.destination);
    }
    // Resume if suspended (autoplay policy)
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume().catch(() => {});
    }
    return ctxRef.current;
  }, []);

  // ===================== Fetch + Decode buffer =====================
  const loadBuffer = useCallback(
    async (soundId: string, src: string): Promise<AudioBuffer | null> => {
      // Cache hit
      const cached = buffersRef.current.get(soundId);
      if (cached) return cached;

      try {
        const ctx = getContext();
        const response = await fetch(src);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
        buffersRef.current.set(soundId, audioBuffer);
        return audioBuffer;
      } catch {
        console.warn(`[bekhab] Failed to load sound: ${soundId}`);
        return null;
      }
    },
    [getContext]
  );

  // ===================== Start a track =====================
  const startTrack = useCallback(
    async (soundId: string, src: string) => {
      // Already playing
      if (tracksRef.current.has(soundId)) return;

      const buffer = await loadBuffer(soundId, src);
      if (!buffer || !masterGainRef.current) return;

      const ctx = getContext();
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gain = ctx.createGain();
      const vol = volumes[soundId] ?? 0.5;
      // Fade in
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + FADE_TIME);

      source.connect(gain);
      gain.connect(masterGainRef.current);
      source.start(0);

      tracksRef.current.set(soundId, { source, gain, buffer });
    },
    [getContext, loadBuffer, volumes]
  );

  // ===================== Stop a track =====================
  const stopTrack = useCallback(
    (soundId: string) => {
      const track = tracksRef.current.get(soundId);
      if (!track) return;

      const ctx = ctxRef.current;
      if (ctx) {
        // Fade out to prevent click
        track.gain.gain.setValueAtTime(track.gain.gain.value, ctx.currentTime);
        track.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + FADE_TIME);

        // Schedule stop after fade
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

      tracksRef.current.delete(soundId);
    },
    []
  );

  // ===================== Change volume =====================
  const changeVolume = useCallback(
    (soundId: string, volume: number) => {
      setVolume(soundId, volume);
      const track = tracksRef.current.get(soundId);
      if (track && ctxRef.current) {
        track.gain.gain.setValueAtTime(track.gain.gain.value, ctxRef.current.currentTime);
        track.gain.gain.linearRampToValueAtTime(volume, ctxRef.current.currentTime + FADE_TIME);
      }
    },
    [setVolume]
  );

  // ===================== Play/Pause =====================
  const playSound = useCallback(
    (soundId: string, src: string) => {
      startTrack(soundId, src);
    },
    [startTrack]
  );

  const stopSound = useCallback(
    (soundId: string) => {
      stopTrack(soundId);
    },
    [stopTrack]
  );

  // ===================== Toggle global =====================
  const toggleGlobal = useCallback(() => {
    const newState = !isGlobalPlaying;
    setGlobalPlaying(newState);

    if (newState) {
      // Resume context
      ctxRef.current?.resume().catch(() => {});
      // Start all active sounds
      activeSounds.forEach((src, soundId) => {
        startTrack(soundId, src);
      });
    } else {
      // Suspend context (pauses everything cleanly)
      ctxRef.current?.suspend().catch(() => {});
    }
  }, [isGlobalPlaying, activeSounds, setGlobalPlaying, startTrack]);

  // ===================== Stop all =====================
  const stopAll = useCallback(() => {
    tracksRef.current.forEach((_track, soundId) => {
      stopTrack(soundId);
    });
    setGlobalPlaying(false);
  }, [setGlobalPlaying, stopTrack]);

  // ===================== Sync active sounds =====================
  useEffect(() => {
    if (!isGlobalPlaying) return;

    // Start new sounds
    activeSounds.forEach((src, soundId) => {
      if (!tracksRef.current.has(soundId)) {
        startTrack(soundId, src);
      }
    });

    // Stop removed sounds
    tracksRef.current.forEach((_track, soundId) => {
      if (!activeSounds.has(soundId)) {
        stopTrack(soundId);
      }
    });
  }, [activeSounds, isGlobalPlaying, startTrack, stopTrack]);

  // ===================== Sync volumes =====================
  useEffect(() => {
    Object.entries(volumes).forEach(([soundId, volume]) => {
      const track = tracksRef.current.get(soundId);
      if (track && ctxRef.current) {
        track.gain.gain.setValueAtTime(track.gain.gain.value, ctxRef.current.currentTime);
        track.gain.gain.linearRampToValueAtTime(volume, ctxRef.current.currentTime + FADE_TIME);
      }
    });
  }, [volumes]);

  // ===================== Cleanup on unmount =====================
  useEffect(() => {
    const tracks = tracksRef.current;
    const ctx = ctxRef.current;
    return () => {
      tracks.forEach((track) => {
        try {
          track.source.stop();
        } catch {}
        track.source.disconnect();
        track.gain.disconnect();
      });
      tracks.clear();
      ctx?.close().catch(() => {});
    };
  }, []);

  return {
    playSound,
    stopSound,
    changeVolume,
    toggleGlobal,
    stopAll,
    toggleSound,
    activeSounds,
    volumes,
    isGlobalPlaying,
  };
}
