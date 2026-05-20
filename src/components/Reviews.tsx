// Reviews.tsx — نظرات کاربران — تم آبسیدین
"use client";

interface ReviewCardProps {
  author: string;
  children: React.ReactNode;
}

function ReviewCard({ author, children }: ReviewCardProps) {
  return (
    <div className="glass rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.08] relative">
      <span className="absolute right-4 -top-3 text-2xl text-indigo-400/50">❝</span>
      <p className="text-white/60 text-sm leading-relaxed mb-3">{children}</p>
      <p className="text-xs text-indigo-300/60 text-left" dir="ltr">
        &mdash; {author}
      </p>
    </div>
  );
}

export default function Reviews() {
  return (
    <section id="reviews" className="w-full py-16 px-6">
      <h2 className="text-xl md:text-2xl font-bold text-center mb-10">
        <span className="gradient-text">نظرات کاربران</span>
      </h2>

      <div className="max-w-content mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReviewCard author="سارا م.">
          ترکیب صدای باران تهران و آتش بخاری بهترین محیط رو برای مطالعه درست
          می‌کنه. حالت تمرکز هم عالیه!
        </ReviewCard>

        <ReviewCard author="امیر ر.">
          بِخواب بهترین اپ صدای محیطی‌ه که تا حالا استفاده کردم. بدون تبلیغ و
          کیفیت صدا فوق‌العاده!
        </ReviewCard>

        <ReviewCard author="مریم ک.">
          محاسبه‌گر خواب واقعاً کار می‌کنه! از وقتی بر اساس چرخه‌های REM
          می‌خوابم، صبح‌ها سرحال‌تر بیدار می‌شم.
        </ReviewCard>
      </div>
    </section>
  );
}
