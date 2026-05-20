// SleepReport.tsx — گزارش خواب با نمودار ستونی CSS
"use client";

import { useState, useEffect } from "react";
import { useSleepTracker, buildHourlyBuckets, type SleepSession, type HourlyBucket } from "@/hooks/useSleepTracker";

function getQualityLabel(efficiency: number): { label: string; color: string; emoji: string } {
  if (efficiency >= 85) return { label: "عالی", color: "text-emerald-400", emoji: "🌟" };
  if (efficiency >= 70) return { label: "خوب", color: "text-indigo-400", emoji: "😊" };
  if (efficiency >= 50) return { label: "متوسط", color: "text-amber-400", emoji: "😐" };
  return { label: "ضعیف", color: "text-rose-400", emoji: "😴" };
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
  const { lastSession, loadAllSessions } = useSleepTracker();
  const [sessions, setSessions] = useState<SleepSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SleepSession | null>(null);
  const [buckets, setBuckets] = useState<HourlyBucket[]>([]);

  useEffect(() => {
    loadAllSessions().then((all) => {
      setSessions(all.sort((a, b) => b.startTime - a.startTime).slice(0, 7));
    });
  }, [loadAllSessions]);

  useEffect(() => {
    const session = selectedSession || lastSession;
    if (session) {
      setBuckets(buildHourlyBuckets(session));
    }
  }, [selectedSession, lastSession]);

  const session = selectedSession || lastSession;

  if (!session) {
    return (
      <section className="py-12">
        <h2 className="text-xl font-bold text-white/90 text-center mb-4">
          📊 گزارش خواب
        </h2>
        <div className="glass rounded-2xl p-8 text-center max-w-md mx-auto">
          <p className="text-white/40 text-sm">
            هنوز هیچ جلسه خوابی ثبت نشده.
            <br />
            از بخش ردیابی خواب استفاده کنید.
          </p>
        </div>
      </section>
    );
  }

  const quality = getQualityLabel(session.efficiency);
  const duration = session.endTime - session.startTime;
  const maxMovement = Math.max(...buckets.map((b) => b.movement), 1);

  return (
    <section className="py-12">
      <h2 className="text-xl font-bold text-white/90 text-center mb-6">
        📊 گزارش خواب
      </h2>

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
                    : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/5"
                }
              `}
            >
              {formatDate(s.startTime)}
            </button>
          ))}
        </div>
      )}

      <div className="glass rounded-2xl p-6 max-w-lg mx-auto">
        {/* Efficiency score */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-white/50 mb-1">کیفیت خواب</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{quality.emoji}</span>
              <span className={`text-2xl font-bold ${quality.color}`}>
                {persianDigits(session.efficiency)}٪
              </span>
              <span className={`text-sm ${quality.color}`}>{quality.label}</span>
            </div>
          </div>
          <div className="text-left">
            <p className="text-sm text-white/50 mb-1">مدت خواب</p>
            <p className="text-sm text-white/80">{formatDuration(duration)}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white/80">
              {persianDigits(session.spikes.length)}
            </p>
            <p className="text-[10px] text-white/40">حرکت</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white/80">
              {persianDigits(Math.round(duration / 3600000))}
            </p>
            <p className="text-[10px] text-white/40">ساعت</p>
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
            <p className="text-[10px] text-white/40">شدت میانگین</p>
          </div>
        </div>

        {/* Bar chart */}
        <div className="mb-4">
          <p className="text-xs text-white/40 mb-3">حرکت در طول شب</p>
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
                  <span className="text-[8px] text-white/30">{bucket.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
