// FocusMode.tsx — حالت تمرکز: صفحه تاریک، صدا ادامه دارد
"use client";

import { useState, useEffect } from "react";
import { useAudioStore } from "@/store/audioStore";
import { TbMoon } from "react-icons/tb";

interface FocusModeProps {
  onExit: () => void;
}

export function FocusModeButton({
  onClick,
}: {
  onClick: () => void;
}) {
  const { activeSounds } = useAudioStore();
  const hasActiveSounds = activeSounds.size > 0;

  if (!hasActiveSounds) return null;

  return (
    <button
      onClick={onClick}
      className="fixed top-4 left-4 z-30 flex items-center gap-2 px-4 py-2 
                 glass rounded-full text-sm text-white/50 hover:text-indigo-300 
                 transition-all duration-300"
      aria-label="حالت تمرکز"
    >
      <TbMoon size={16} />
      <span>حالت تمرکز</span>
    </button>
  );
}

export function FocusModeOverlay({ onExit }: FocusModeProps) {
  const [currentTime, setCurrentTime] = useState("");

  const persianDigits = (str: string) => {
    const digits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return str.replace(/[0-9]/g, (d) => digits[parseInt(d)]);
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, "0");
      const m = now.getMinutes().toString().padStart(2, "0");
      setCurrentTime(persianDigits(`${h}:${m}`));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onExit]);

  return (
    <div
      className="fixed inset-0 z-50 bg-obsidian flex flex-col items-center 
                 justify-center cursor-pointer animate-fadeIn"
      onClick={onExit}
    >
      <div className="text-white/15 text-8xl md:text-9xl font-light tracking-wider tabular-nums">
        {currentTime}
      </div>

      <div className="mt-8 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulseGentle" />
        <span className="text-white/10 text-sm">در حال پخش</span>
        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulseGentle" />
      </div>

      <p className="absolute bottom-8 text-white/10 text-xs">
        برای خروج کلیک کنید یا Escape بزنید
      </p>
    </div>
  );
}
