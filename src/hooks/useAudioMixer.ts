// useAudioMixer.ts — لایه‌ی نازک بین React و موتور صدای سینگلتون
// تمام منطق صدا در src/lib/audioEngine.ts است (یک نمونه‌ی مشترک).
// این هوک فقط state فروشگاه را می‌خواند، موتور را با آن آشتی می‌دهد و
// اکشن‌ها را در اختیار کامپوننت‌ها می‌گذارد.
"use client";

import { useCallback, useEffect } from "react";
import { useAudioStore } from "@/store/audioStore";
import {
  reconcile,
  setTrackVolume,
  suspend,
  resume,
  stopEverything,
} from "@/lib/audioEngine";

export function useAudioMixer() {
  const activeSounds = useAudioStore((s) => s.activeSounds);
  const volumes = useAudioStore((s) => s.volumes);
  const isGlobalPlaying = useAudioStore((s) => s.isGlobalPlaying);
  const toggleSound = useAudioStore((s) => s.toggleSound);
  const setVolume = useAudioStore((s) => s.setVolume);

  // آشتی‌دادن موتور با state — موتور سینگلتون است، پس اجرای چندباره بی‌خطر است.
  useEffect(() => {
    reconcile(activeSounds, volumes, isGlobalPlaying);
  }, [activeSounds, volumes, isGlobalPlaying]);

  const changeVolume = useCallback(
    (soundId: string, volume: number) => {
      setVolume(soundId, volume);
      setTrackVolume(soundId, volume);
    },
    [setVolume]
  );

  const toggleGlobal = useCallback(() => {
    if (isGlobalPlaying) suspend();
    else resume();
  }, [isGlobalPlaying]);

  const stopAll = useCallback(() => {
    stopEverything();
  }, []);

  return {
    // state
    activeSounds,
    volumes,
    isGlobalPlaying,
    // actions
    toggleSound,
    changeVolume,
    toggleGlobal,
    stopAll,
  };
}
