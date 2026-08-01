// GlobalControls.tsx — کنترل‌های سراسری پخش — تم آبسیدین
"use client";

import { useAudioMixer } from "@/hooks/useAudioMixer";
import { TbPlayerPlay, TbPlayerPause, TbPlayerStop } from "react-icons/tb";

export default function GlobalControls() {
  const { activeSounds, isGlobalPlaying, toggleGlobal, stopAll } =
    useAudioMixer();

  const hasActiveSounds = activeSounds.size > 0;

  if (!hasActiveSounds) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40
                    flex items-center gap-3 px-6 py-3 
                    glass rounded-full shadow-2xl
                    animate-fadeIn"
    >
      {/* دکمه Play/Pause */}
      <button
        onClick={toggleGlobal}
        className={`w-12 h-12 rounded-full flex items-center justify-center
                   transition-all duration-200 active:scale-90
                   ${
                     isGlobalPlaying
                       ? "bg-indigo-500/30 text-indigo-300 border border-indigo-400/30"
                       : "bg-white/10 text-white/50 border border-white/10"
                   }`}
        aria-label={isGlobalPlaying ? "توقف همه" : "پخش همه"}
      >
        {isGlobalPlaying ? (
          <TbPlayerPause size={22} />
        ) : (
          <TbPlayerPlay size={22} />
        )}
      </button>

      {/* تعداد صداهای فعال */}
      <div className="flex flex-col items-center">
        <span className="text-white/80 text-sm font-medium">
          {activeSounds.size} صدای فعال
        </span>
        <span className="text-xs text-white/60">
          {isGlobalPlaying ? "در حال پخش" : "متوقف"}
        </span>
      </div>

      {/* دکمه توقف */}
      <button
        onClick={stopAll}
        className="w-10 h-10 rounded-full flex items-center justify-center
                   bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-400/20
                   transition-all duration-200 active:scale-90"
        aria-label="توقف همه صداها"
      >
        <TbPlayerStop size={18} />
      </button>
    </div>
  );
}
