// BreathingCircle.tsx — دایره تنفس ۴-۷-۸
"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Phase = "inhale" | "hold" | "exhale" | "idle";
type ActivePhase = "inhale" | "hold" | "exhale";

const PHASES: Record<ActivePhase, { duration: number; label: string; next: ActivePhase }> = {
  inhale: { duration: 4, label: "دم", next: "hold" },
  hold: { duration: 7, label: "نگه‌دار", next: "exhale" },
  exhale: { duration: 8, label: "بازدم", next: "inhale" },
};

const TOTAL_CYCLE = 4 + 7 + 8; // 19s

export default function BreathingCircle() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [counter, setCounter] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const persianDigits = useCallback((n: number) => {
    const digits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return n.toString().replace(/[0-9]/g, (d) => digits[parseInt(d)]);
  }, []);

  const start = useCallback(() => {
    setIsActive(true);
    setPhase("inhale");
    setCounter(PHASES.inhale.duration);
    setCycleCount(0);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    setPhase("idle");
    setCounter(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (!isActive || phase === "idle") return;

    const activePhase = phase as ActivePhase;
    timerRef.current = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          const current = PHASES[activePhase];
          const nextPhase = current.next;
          setPhase(nextPhase);
          if (nextPhase === "inhale") {
            setCycleCount((c) => c + 1);
          }
          return PHASES[nextPhase].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, phase]);

  // Circle scale animation based on phase
  const getScale = () => {
    if (phase === "inhale") return "scale-110";
    if (phase === "hold") return "scale-110";
    if (phase === "exhale") return "scale-75";
    return "scale-90";
  };

  // Circle glow color
  const getGlow = () => {
    if (phase === "inhale") return "shadow-[0_0_60px_rgba(99,102,241,0.5)]";
    if (phase === "hold") return "shadow-[0_0_80px_rgba(139,92,246,0.5)]";
    if (phase === "exhale") return "shadow-[0_0_40px_rgba(99,102,241,0.3)]";
    return "shadow-none";
  };

  // Phase progress for ring
  const getPhaseProgress = () => {
    if (phase === "idle") return 0;
    const total = PHASES[phase as ActivePhase].duration;
    return ((total - counter) / total) * 100;
  };

  const circumference = 2 * Math.PI * 70; // r=70
  const strokeDashoffset = circumference - (getPhaseProgress() / 100) * circumference;

  return (
    <section className="relative flex flex-col items-center gap-6 py-12">
      {/* Title */}
      <h2 className="text-xl font-bold text-white/90">تنفس ۴-۷-۸</h2>
      <p className="text-sm text-white/50 max-w-xs text-center">
        تکنیک دکتر اندرو وایل — آرام‌سازی سیستم عصبی پاراسمپاتیک
      </p>

      {/* Circle */}
      <div className="relative flex items-center justify-center w-48 h-48">
        {/* Outer ring SVG */}
        <svg
          className="absolute inset-0 w-48 h-48 -rotate-90"
          viewBox="0 0 160 160"
        >
          {/* Background ring */}
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="rgba(99,102,241,0.15)"
            strokeWidth="4"
          />
          {/* Progress ring */}
          {phase !== "idle" && (
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={phase === "hold" ? "#8b5cf6" : "#6366f1"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          )}
        </svg>

        {/* Inner breathing circle */}
        <div
          className={`
            w-32 h-32 rounded-full
            bg-gradient-to-br from-indigo-500/30 to-purple-500/20
            border border-indigo-400/30
            flex flex-col items-center justify-center
            transition-all duration-1000 ease-in-out
            ${getScale()} ${getGlow()}
          `}
        >
          {phase === "idle" ? (
            <span className="text-sm text-white/60">آماده</span>
          ) : (
            <>
              <span className="text-3xl font-bold text-white tabular-nums">
                {persianDigits(counter)}
              </span>
              <span className="text-sm text-indigo-300 mt-1">
                {PHASES[phase as ActivePhase].label}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Cycle count */}
      {isActive && (
        <p className="text-xs text-white/40">
          سیکل {persianDigits(cycleCount + 1)} · {persianDigits(TOTAL_CYCLE)} ثانیه
        </p>
      )}

      {/* Control button */}
      <button
        onClick={isActive ? stop : start}
        className={`
          px-8 py-3 rounded-2xl text-sm font-medium
          transition-all duration-300
          ${
            isActive
              ? "bg-white/10 text-white/70 hover:bg-white/15 border border-white/10"
              : "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-400/30"
          }
        `}
      >
        {isActive ? "توقف" : "شروع تنفس"}
      </button>
    </section>
  );
}
