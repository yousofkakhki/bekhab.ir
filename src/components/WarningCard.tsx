// WarningCard.tsx — هشدار خواب ناکافی — تم آبسیدین
"use client";

export default function WarningCard() {
  return (
    <div className="mt-4 animate-fadeIn">
      <div className="glass border border-amber-500/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5">⚠️</span>
          <div className="flex-1">
            <h3 className="text-amber-400 font-bold mb-2 text-sm">
              مدت خواب کوتاه است
            </h3>
            <p className="text-white/40 text-xs leading-relaxed">
              این گزینه کمتر از ۶ ساعت زمان خواب در نظر می‌گیرد. برای بیشتر
              بزرگسالان این مقدار از بازه پیشنهادی معمول کوتاه‌تر است.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
