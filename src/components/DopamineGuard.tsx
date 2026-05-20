// DopamineGuard.tsx — نگهبان دوپامین (۱۲ شب تا ۵ صبح)
// رابط کاربری ساده‌شده برای جلوگیری از وسوسه گوشی در شب
"use client";

import { useState, useEffect, useCallback } from "react";

function getCurrentHour(): number {
  return new Date().getHours();
}

function isDopamineHour(hour: number): boolean {
  return hour >= 0 && hour < 5;
}

export default function DopamineGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isGuardActive, setIsGuardActive] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  const persianDigits = useCallback((str: string) => {
    const digits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return str.replace(/[0-9]/g, (d) => digits[parseInt(d)]);
  }, []);

  useEffect(() => {
    const check = () => {
      const hour = getCurrentHour();
      setIsGuardActive(isDopamineHour(hour));
      const now = new Date();
      setCurrentTime(
        persianDigits(
          `${now.getHours().toString().padStart(2, "0")}:${now
            .getMinutes()
            .toString()
            .padStart(2, "0")}`
        )
      );
    };

    check();
    const interval = setInterval(check, 60000); // check every minute
    return () => clearInterval(interval);
  }, [persianDigits]);

  // If guard dismissed or not in dopamine hours, show normal content
  if (!isGuardActive || dismissed) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-obsidian flex flex-col items-center justify-center p-8 dopamine-dimmed">
      {/* Moon animation */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-400/30 to-indigo-600/10 animate-pulseGentle" />
        <div className="absolute inset-2 rounded-full bg-obsidian" />
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-indigo-400/20 to-transparent" />
        {/* Crescent shadow */}
        <div className="absolute top-2 right-2 w-16 h-20 rounded-full bg-obsidian" />
      </div>

      {/* Time */}
      <p className="text-5xl font-bold text-white/80 tabular-nums mb-4">
        {currentTime}
      </p>

      {/* Message */}
      <h2 className="text-2xl font-bold text-white/90 mb-2">
        وقت خوابه 🌙
      </h2>
      <p className="text-white/40 text-center max-w-sm mb-8 text-sm leading-relaxed">
        الان بین ۱۲ شب تا ۵ صبح هست. مغز شما به استراحت نیاز داره.
        <br />
        گوشی رو بذارید کنار و بخوابید.
      </p>

      {/* Sleep tips */}
      <div className="glass rounded-2xl p-4 max-w-xs mb-8">
        <p className="text-xs text-indigo-300 mb-2 font-medium">💡 نکته خواب</p>
        <p className="text-xs text-white/50 leading-relaxed">
          نور آبی صفحه‌نمایش ترشح ملاتونین را مهار می‌کند و خواب شما را تا ۲ ساعت عقب می‌اندازد.
        </p>
      </div>

      {/* Dismiss (intentionally small and hard to press) */}
      <button
        onClick={() => setDismissed(true)}
        className="text-[10px] text-white/15 hover:text-white/30 transition-colors duration-500 mt-4"
      >
        ادامه استفاده (توصیه نمی‌شود)
      </button>
    </div>
  );
}
