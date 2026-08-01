// SleepReport.tsx — گزارش خواب با نمودار ستونی CSS
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSleepTracker, buildHourlyBuckets, type SleepSession } from "@/hooks/useSleepTracker";

function getMovementLabel(efficiency: number): { label: string; color: string; emoji: string } {
  if (efficiency >= 85) return { label: "بسیار آرام", color: "text-emerald-400", emoji: "🌟" };
  if (efficiency >= 70) return { label: "آرام", color: "text-indigo-400", emoji: "😊" };
  if (efficiency >= 50) return { label: "متوسط", color: "text-amber-400", emoji: "😐" };
  return { label: "پرتحرک", color: "text-rose-400", emoji: "↕️" };
}

const persianDigits = (n: number | string) => {
  const digits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return n.toString().replace(/[0-9]/g, (d) => digits[parseInt(d)]);
};

function formatDuration(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  return `${persianDigits(hours)} ساعت و ${persianDigits(minutes)} دقیقه`;
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  const months = [
    "ژانویه", "فوریه", "مارس", "آوریل", "مه", "ژوئن",
    "ژوئیه", "اوت", "سپتامبر", "اکتبر", "نوامبر", "دسامبر"
  ];
  return `${persianDigits(d.getDate())} ${months[d.getMonth()]}`;
}

export default function SleepReport() {
  const {
    isTracking,
    lastSession,
    error,
    startTracking,
    stopTracking,
    loadAllSessions,
  } = useSleepTracker();
  const [storedSessions, setStoredSessions] = useState<SleepSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SleepSession | null>(null);

  useEffect(() => {
    loadAllSessions()
      .then((all) => {
        setStoredSessions(all.sort((a, b) => b.startTime - a.startTime).slice(0, 7));
      })
      .catch(() => setStoredSessions([]));
  }, [loadAllSessions]);

  const sessions = useMemo(() => {
    const previous = lastSession
      ? storedSessions.filter((item) => item.id !== lastSession.id)
      : storedSessions;
    return [...(lastSession ? [lastSession] : []), ...previous]
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, 7);
  }, [lastSession, storedSessions]);

  const toggleTracking = async () => {
    if (isTracking) {
      setSelectedSession(null);
      await stopTracking();
    } else {
      await startTracking();
    }
  };

  const session = selectedSession || lastSession;
  const buckets = useMemo(
    () => (session ? buildHourlyBuckets(session) : []),
    [session],
  );
  const trackerControls = (
    <div className="glass rounded-2xl p-6 text-center max-w-md mx-auto mb-6">
      <p className="text-white/70 text-sm mb-2">
        گوشی را هنگام خواب روی تشک و نزدیک خود قرار دهید.
      </p>
      <p className="text-white/50 text-xs mb-4">
        ثبت با سنسور حرکت انجام می‌شود و برای ادامه باید این صفحه باز بماند.
        این شاخص جایگزین ابزار پزشکی یا سنجش مراحل خواب نیست.
      </p>
      <button
        type="button"
        onClick={() => void toggleTracking()}
        className={`rounded-full px-6 py-3 text-sm font-medium transition-colors ${
          isTracking
            ? "border border-rose-400/30 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30"
            : "border border-indigo-400/30 bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30"
        }`}
      >
        {isTracking ? "پایان و ذخیره حرکت‌ها" : "شروع ثبت حرکت شبانه"}
      </button>
      {isTracking && (
        <p aria-live="polite" className="mt-3 text-xs text-emerald-300">
          ردیابی فعال است…
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-300">
          {error}
        </p>
      )}
    </div>
  );

  if (!session) {
    return (
      <section className="py-12">
        <h2 className="text-xl font-bold text-white/90 text-center mb-4">
          شاخص آرامش حرکتی
        </h2>
        {trackerControls}
        <div className="glass rounded-2xl p-8 text-center max-w-md mx-auto">
          <p className="text-white/60 text-sm">
            هنوز هیچ جلسه‌ای ثبت نشده.
            <br />
            از بخش ثبت حرکت شبانه استفاده کنید.
          </p>
        </div>
      </section>
    );
  }

  const quality = getMovementLabel(session.efficiency);
  const duration = session.endTime - session.startTime;
  const maxMovement = Math.max(...buckets.map((b) => b.movement), 1);

  return (
    <section className="py-12">
      <h2 className="text-xl font-bold text-white/90 text-center mb-6">
        شاخص آرامش حرکتی
      </h2>

      {trackerControls}

      {/* Session selector */}
      {sessions.length > 1 && (
        <div className="flex gap-2 justify-center mb-6 flex-wrap">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSession(s)}
              className={`
                text-xs px-3 py-1.5 rounded-full transition-all
                ${
                  (selectedSession?.id || lastSession?.id) === s.id
                    ? "bg-indigo-500/30 text-indigo-300 border border-indigo-400/30"
                    : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/5"
                }
              `}
            >
              {formatDate(s.startTime)}
            </button>
          ))}
        </div>
      )}

      <div className="glass rounded-2xl p-6 max-w-lg mx-auto">
        {/* Movement score */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-white/50 mb-1">شاخص این جلسه</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{quality.emoji}</span>
              <span className={`text-2xl font-bold ${quality.color}`}>
                {persianDigits(session.efficiency)}٪
              </span>
              <span className={`text-sm ${quality.color}`}>{quality.label}</span>
            </div>
          </div>
          <div className="text-left">
            <p className="text-sm text-white/50 mb-1">مدت ثبت</p>
            <p className="text-sm text-white/80">{formatDuration(duration)}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white/80">
              {persianDigits(session.spikes.length)}
            </p>
            <p className="text-[10px] text-white/60">حرکت</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white/80">
              {persianDigits(Math.round(duration / 3600000))}
            </p>
            <p className="text-[10px] text-white/60">ساعت</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white/80">
              {persianDigits(
                session.spikes.length > 0
                  ? Math.round(
                      session.spikes.reduce((s, sp) => s + sp.magnitude, 0) /
                        session.spikes.length * 10
                    ) / 10
                  : 0
              )}
            </p>
            <p className="text-[10px] text-white/60">شدت میانگین</p>
          </div>
        </div>

        {/* Bar chart */}
        <div className="mb-4">
          <p className="text-xs text-white/60 mb-3">حرکت در طول شب</p>
          <div className="flex items-end gap-1 h-24">
            {buckets.map((bucket, i) => {
              const height = Math.max(4, (bucket.movement / maxMovement) * 100);
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-t-sm transition-all duration-300 sleep-bar"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-[8px] text-white/60">{bucket.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
