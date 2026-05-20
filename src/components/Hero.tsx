// Hero.tsx — بخش معرفی + مزایا — تم آبسیدین
"use client";

import {
  TbBed,
  TbRocket,
  TbTrees,
  TbMoodSmile,
  TbBabyCarriage,
  TbHeadphones,
} from "react-icons/tb";
import type { IconType } from "react-icons";

export default function Hero() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="w-full max-w-content mx-auto px-6 md:px-10 pt-4 pb-12">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Moon glow */}
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-indigo-500/20 rounded-full scale-150" />
            <span className="relative text-[100px] md:text-[140px] leading-none select-none">
              🌙
            </span>
          </div>

          {/* متن */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-snug">
            <span className="gradient-text">آرام بگیرید. بخوابید.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-lg">
            اکوسیستم هوشمند خواب با{" "}
            <span className="text-indigo-400 font-medium">
              صداهای طبیعی آرامش‌بخش
            </span>
          </p>

          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <span className="px-4 py-2 text-sm bg-indigo-500/10 text-indigo-300 rounded-full font-medium border border-indigo-400/20">
              🇮🇷 ساخت ایران
            </span>
            <span className="px-4 py-2 text-sm bg-white/5 text-white/50 rounded-full font-medium border border-white/10">
              رایگان و بدون تبلیغ
            </span>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="w-full max-w-content mx-auto px-6 md:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-12 gap-y-5 items-center justify-items-center">
          <Benefit icon={TbRocket}>
            افزایش بهره‌وری با تمرکز بیشتر
          </Benefit>
          <Benefit icon={TbMoodSmile}>
            کاهش استرس و اضطراب
          </Benefit>
          <Benefit icon={TbTrees}>
            بهبود تجربه مدیتیشن
          </Benefit>
          <Benefit icon={TbBed}>
            انقلابی در کیفیت خواب
          </Benefit>
          <Benefit icon={TbHeadphones}>
            تسکین وزوز گوش
          </Benefit>
          <Benefit icon={TbBabyCarriage}>
            خواب راحت کودک
          </Benefit>
        </div>
      </section>
    </div>
  );
}

function Benefit({
  icon: Icon,
  children,
}: {
  icon: IconType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 justify-center">
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 flex-shrink-0 border border-indigo-400/20">
        <Icon size={20} />
      </div>
      <span className="font-medium text-white/70">{children}</span>
    </div>
  );
}
