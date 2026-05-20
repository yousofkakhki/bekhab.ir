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
              خواب کم‌کیفیت؟
            </h3>
            <p className="text-white/40 text-xs leading-relaxed mb-3">
              کمتر از ۶ ساعت خواب می‌تواند تأثیرات منفی بر سلامت جسمی و ذهنی شما
              داشته باشد.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href="#shop"
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                           bg-amber-500/10 border border-amber-500/20
                           hover:bg-amber-500/20 transition-all duration-300
                           text-amber-300 text-xs font-medium"
              >
                <span>🛏️</span>
                <span>محصولات بهبود خواب</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
