// RestlessIntervener.tsx — مداخله‌گر بی‌قراری
// تشخیص visibilitychange برای بازگرداندن کاربر به خواب
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export default function RestlessIntervener() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [awayCount, setAwayCount] = useState(0);
  const lastHiddenRef = useRef<number>(0);
  const isTrackingRef = useRef(false);

  const persianDigits = useCallback((n: number) => {
    const digits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return n.toString().replace(/[0-9]/g, (d) => digits[parseInt(d)]);
  }, []);

  // Enable tracking (should be called when user starts sleep session)
  const enableTracking = useCallback(() => {
    isTrackingRef.current = true;
    setAwayCount(0);
  }, []);

  const disableTracking = useCallback(() => {
    isTrackingRef.current = false;
    setShowOverlay(false);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!isTrackingRef.current) return;

      if (document.hidden) {
        // User left — record timestamp
        lastHiddenRef.current = Date.now();
      } else {
        // User returned — show intervention if they were away > 10s
        const awayDuration = Date.now() - lastHiddenRef.current;
        if (awayDuration > 10000 && lastHiddenRef.current > 0) {
          setAwayCount((c) => c + 1);
          setShowOverlay(true);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Auto-dismiss after 10s
  useEffect(() => {
    if (!showOverlay) return;
    const timeout = setTimeout(() => setShowOverlay(false), 10000);
    return () => clearTimeout(timeout);
  }, [showOverlay]);

  if (!showOverlay) {
    return (
      // Hidden element to expose enableTracking via ref or context if needed
      <div
        data-restless-intervener
        data-enable={enableTracking}
        data-disable={disableTracking}
        className="hidden"
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-6"
      onClick={() => setShowOverlay(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-obsidian/90 backdrop-blur-xl" />

      {/* Content */}
      <div className="relative glass rounded-3xl p-8 max-w-sm text-center animate-fadeIn">
        {/* Gentle pulse */}
        <div className="mx-auto w-16 h-16 mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-pulseGentle" />
          <div className="absolute inset-0 flex items-center justify-center text-3xl">
            😴
          </div>
        </div>

        <h3 className="text-lg font-bold text-white/90 mb-2">برگشتی؟</h3>
        <p className="text-sm text-white/50 leading-relaxed mb-4">
          بِخواب هنوز داره صداهای آرامش‌بخش رو پخش می‌کنه.
          <br />
          گوشی رو بذار و به خواب برگرد 🌙
        </p>

        {awayCount > 1 && (
          <p className="text-xs text-indigo-300/60">
            {persianDigits(awayCount)} بار از خواب بیدار شدید
          </p>
        )}

        <p className="text-[10px] text-white/20 mt-4">
          برای بستن هر جایی بزنید
        </p>
      </div>
    </div>
  );
}

// Export tracking controls for parent components
export { };
