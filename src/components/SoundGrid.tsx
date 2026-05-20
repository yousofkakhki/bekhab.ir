// SoundGrid.tsx — شبکه صداها — تم آبسیدین
"use client";

import { useAudioMixer } from "@/hooks/useAudioMixer";
import { SOUNDS } from "@/lib/sound-config";
import { useAudioStore } from "@/store/audioStore";
import {
  TbPlayerPlay,
  TbPlayerPause,
  TbVolume,
  TbVolume2,
  TbVolume3,
} from "react-icons/tb";

export default function SoundGrid() {
  const { activeSounds, volumes, toggleSound, changeVolume } = useAudioMixer();
  const { saveFavoriteMix, favoriteMix } = useAudioStore();

  const hasActiveSounds = activeSounds.size > 0;

  return (
    <section id="sounds" className="w-full max-w-content mx-auto px-6 md:px-10 py-12 lg:py-20">
      {/* هدر */}
      <div className="flex flex-col items-center text-center gap-4 mb-10">
        <h2 className="text-2xl md:text-3xl font-bold">
          <span className="gradient-text">صداهای آرامش‌بخش</span>
        </h2>
        <p className="text-sm text-white/40 max-w-md">
          صداهای طبیعی را ترکیب کنید و فضای صوتی دلخواه خود را بسازید
        </p>

        {hasActiveSounds && (
          <button
            onClick={saveFavoriteMix}
            className="px-6 py-2.5 text-sm font-medium rounded-full 
                       bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300
                       border border-indigo-400/20
                       transition-all duration-300"
          >
            💾 ذخیره ترکیب فعلی
          </button>
        )}
      </div>

      {/* اطلاع‌رسانی ترکیب ذخیره‌شده */}
      {favoriteMix && favoriteMix.length > 0 && !hasActiveSounds && (
        <div className="mb-6 p-4 rounded-xl glass text-sm text-indigo-300 text-center border border-indigo-400/20">
          💡 شما یک ترکیب ذخیره‌شده دارید. صداهای مورد علاقه‌تان را فعال کنید!
        </div>
      )}

      {/* شبکه کارت‌ها */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {SOUNDS.map((sound) => {
          const isActive = activeSounds.has(sound.id);
          const volume = volumes[sound.id] ?? sound.defaultVolume;

          return (
            <div
              key={sound.id}
              className={`
                flex flex-col items-center gap-3 p-4 rounded-2xl
                transition-all duration-300
                ${
                  isActive
                    ? "glass-card ring-1"
                    : "bg-white/[0.03] hover:bg-white/[0.06] border border-white/5"
                }
              `}
              style={
                isActive
                  ? {
                      borderColor: `${sound.color}40`,
                      boxShadow: `0 0 30px ${sound.color}15`,
                    }
                  : undefined
              }
            >
              {/* آیکون */}
              <span
                className={`text-4xl transition-all duration-300 cursor-pointer select-none ${
                  isActive ? "scale-110" : "opacity-50 hover:opacity-70"
                }`}
                onClick={() => toggleSound(sound.id, sound.src)}
                role="button"
                aria-label={sound.name}
              >
                {sound.icon}
              </span>

              {/* نام */}
              <span className={`text-xs text-center font-medium ${
                isActive ? "text-white/90" : "text-white/40"
              }`}>
                {sound.name}
              </span>

              {/* کنترل‌ها */}
              <div className="w-full flex items-center gap-2" dir="ltr">
                <button
                  onClick={() => toggleSound(sound.id, sound.src)}
                  className={`w-7 h-7 flex items-center justify-center rounded-full 
                             transition-all duration-200 flex-shrink-0
                             ${
                               isActive
                                 ? "bg-white/15 text-white border border-white/20"
                                 : "bg-white/5 text-white/30 border border-white/10 hover:bg-white/10"
                             }`}
                  aria-label={`${isActive ? "توقف" : "پخش"} ${sound.name}`}
                >
                  {isActive ? (
                    <TbPlayerPause size={14} />
                  ) : (
                    <TbPlayerPlay size={14} />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) =>
                    changeVolume(sound.id, parseFloat(e.target.value))
                  }
                  className="flex-1"
                  aria-label={`حجم صدای ${sound.name}`}
                  dir="ltr"
                />

                <span className="text-white/30 flex-shrink-0">
                  {volume === 0 ? (
                    <TbVolume3 size={14} />
                  ) : volume < 0.5 ? (
                    <TbVolume2 size={14} />
                  ) : (
                    <TbVolume size={14} />
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
