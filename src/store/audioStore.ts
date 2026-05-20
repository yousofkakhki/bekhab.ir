// audioStore.ts — Zustand store برای مدیریت صداها
"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AudioState {
  /** Map<soundId, audioSrc> — صداهای فعال */
  activeSounds: Map<string, string>;
  /** Map<soundId, volume 0-1> */
  volumes: Record<string, number>;
  /** آیا پخش سراسری فعال است */
  isGlobalPlaying: boolean;
  /** ترکیب مورد علاقه */
  favoriteMix: { soundId: string; volume: number }[] | null;

  // اکشن‌ها
  toggleSound: (soundId: string, src: string) => void;
  setVolume: (soundId: string, volume: number) => void;
  setGlobalPlaying: (playing: boolean) => void;
  saveFavoriteMix: () => void;
  loadFavoriteMix: () => void;
  clearAll: () => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      activeSounds: new Map(),
      volumes: {},
      isGlobalPlaying: false,
      favoriteMix: null,

      toggleSound: (soundId: string, src: string) => {
        set((state) => {
          const newSounds = new Map(state.activeSounds);
          if (newSounds.has(soundId)) {
            newSounds.delete(soundId);
          } else {
            newSounds.set(soundId, src);
          }
          return {
            activeSounds: newSounds,
            isGlobalPlaying: newSounds.size > 0 ? true : false,
          };
        });
      },

      setVolume: (soundId: string, volume: number) => {
        set((state) => ({
          volumes: { ...state.volumes, [soundId]: volume },
        }));
      },

      setGlobalPlaying: (playing: boolean) => {
        set({ isGlobalPlaying: playing });
      },

      saveFavoriteMix: () => {
        const { activeSounds, volumes } = get();
        const mix: { soundId: string; volume: number }[] = [];
        activeSounds.forEach((_, soundId) => {
          mix.push({ soundId, volume: volumes[soundId] ?? 0.5 });
        });
        set({ favoriteMix: mix });
      },

      loadFavoriteMix: () => {
        const { favoriteMix } = get();
        if (!favoriteMix) return;

        // در اینجا فقط اطلاعات ذخیره می‌شود
        // لود واقعی در کامپوننت انجام می‌شود
      },

      clearAll: () => {
        set({
          activeSounds: new Map(),
          volumes: {},
          isGlobalPlaying: false,
        });
      },
    }),
    {
      name: "bekhab-audio-store",
      // Map قابل سریالایز نیست، پس باید تبدیلش کنیم
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          if (parsed?.state?.activeSounds) {
            parsed.state.activeSounds = new Map(
              Object.entries(parsed.state.activeSounds)
            );
          }
          return parsed;
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              activeSounds: Object.fromEntries(
                value.state.activeSounds || new Map()
              ),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      partialize: (state) => ({
        volumes: state.volumes,
        favoriteMix: state.favoriteMix,
        activeSounds: state.activeSounds,
      } as unknown as AudioState),
    }
  )
);
