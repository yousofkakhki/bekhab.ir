// SleepCalculator.tsx — محاسبه‌گر خواب — تم آبسیدین
"use client";

import { useState } from "react";
import {
  TbAdjustments,
  TbMoon,
  TbAlarm,
} from "react-icons/tb";
import {
  calculateBedtime,
  toPersianDigits,
  getSleepQuality,
  type BedtimeResult,
} from "@/lib/sleepMath";
import WarningCard from "./WarningCard";

export default function SleepCalculator() {
  const [wakeTime, setWakeTime] = useState("07:00");
  const [result, setResult] = useState<BedtimeResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleCalculate = () => {
    const bedtimeResult = calculateBedtime(wakeTime);
    setResult(bedtimeResult);
    setShowResult(true);
  };

  const qualityColors: Record<string, string> = {
    good: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    fair: "bg-amber-500/10 border-amber-500/30 text-amber-400",
    poor: "bg-rose-500/10 border-rose-500/30 text-rose-400",
  };

  const qualityLabels: Record<string, string> = {
    good: "عالی ✨",
    fair: "متوسط ⚠️",
    poor: "ناکافی ❌",
  };

  const cycleEmojis: Record<number, string> = {
    6: "😴💤💤",
    5: "😴💤",
    4: "😴",
    3: "😟",
  };

  return (
    <section id="sleep" className="w-full max-w-content mx-auto px-6 md:px-10 py-16 lg:py-20">
      <div className="flex flex-col lg:flex-row-reverse items-center gap-12 lg:gap-20">
        {/* ستون محاسبه */}
        <div className="w-full lg:w-1/2">
          <div className="glass rounded-3xl p-6 md:p-8">
            <p className="text-white/50 mb-5 text-sm">
              چه ساعتی می‌خواهید بیدار شوید؟
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative">
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => {
                    setWakeTime(e.target.value);
                    setShowResult(false);
                  }}
                  className="bg-white/5 border border-white/10 rounded-xl px-6 py-3 
                             text-2xl text-white text-center focus:border-indigo-400/50 
                             focus:outline-none transition-colors"
                  dir="ltr"
                />
              </div>

              <button
                onClick={handleCalculate}
                className="px-8 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 
                           border border-indigo-400/30 rounded-full font-medium 
                           transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10"
              >
                محاسبه کن
              </button>
            </div>

            {/* نتایج */}
            {showResult && result && (
              <div className="mt-6 animate-fadeIn">
                <p className="text-indigo-300 font-medium mb-4 text-sm">
                  برای بیداری در ساعت{" "}
                  <span className="text-white text-lg font-bold mx-1" dir="ltr">
                    {toPersianDigits(result.wakeTime)}
                  </span>
                  ، بهترین زمان‌ها:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.bedtimes.map((time, i) => {
                    const quality = getSleepQuality(result.sleepDurations[i]);
                    const cycles = result.cycles[i];

                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between p-4 rounded-xl 
                                   border transition-all duration-200 hover:scale-[1.02]
                                   ${qualityColors[quality]}`}
                      >
                        <div className="flex flex-col">
                          <span className="text-2xl font-bold text-white" dir="ltr">
                            {toPersianDigits(time)}
                          </span>
                          <span className="text-xs opacity-60 mt-1">
                            {toPersianDigits(cycles.toString())} چرخه •{" "}
                            {toPersianDigits(
                              result.sleepDurations[i].toString()
                            )}{" "}
                            ساعت
                          </span>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="text-lg">{cycleEmojis[cycles]}</span>
                          <span className="text-xs font-medium">
                            {qualityLabels[quality]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-4 text-xs text-white/25 text-center">
                  💡 بر اساس چرخه‌های ۹۰ دقیقه‌ای REM و ۱۵ دقیقه زمان به خواب
                  رفتن
                </p>

                {result.sleepDurations.some((d) => d < 6) && <WarningCard />}
              </div>
            )}
          </div>
        </div>

        {/* ستون توضیحات */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start gap-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center lg:text-right leading-snug">
            محاسبه‌گر هوشمند{" "}
            <span className="text-indigo-400">چرخه خواب</span>
          </h2>

          <p className="text-white/40 text-center lg:text-right max-w-xl text-sm leading-relaxed">
            بر اساس چرخه‌های ۹۰ دقیقه‌ای REM، بهترین زمان خواب و بیداری را
            محاسبه کنید. بیدار شدن بین چرخه‌ها باعث خستگی می‌شود.
          </p>

          <div className="flex flex-col gap-4 w-full">
            <div className="border-b border-white/5 pb-4">
              <FeatureItem icon={TbAdjustments}>
                محاسبه دقیق ۴ زمان بهینه خواب
              </FeatureItem>
            </div>
            <div className="border-b border-white/5 pb-4">
              <FeatureItem icon={TbMoon}>
                احتساب ۱۵ دقیقه زمان به خواب رفتن
              </FeatureItem>
            </div>
            <div>
              <FeatureItem icon={TbAlarm}>
                نمایش کیفیت خواب هر گزینه
              </FeatureItem>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureItem({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 flex-shrink-0 border border-indigo-400/20">
        <Icon size={20} />
      </div>
      <span className="font-medium text-white/60">{children}</span>
    </div>
  );
}
