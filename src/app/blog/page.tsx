// Blog route — مقالات خواب برای سئو
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "بلاگ خواب | بِخواب — مقالات علمی بهبود خواب",
  description:
    "مقالات علمی و کاربردی درباره بهداشت خواب، ریتم شبانه‌روزی، تنفس ۴-۷-۸، تأثیر نویز سفید و ترفندهای بهبود کیفیت خواب.",
  openGraph: {
    title: "بلاگ خواب | بِخواب",
    description: "مقالات علمی بهبود خواب به فارسی",
    url: "https://bekhab.ir/blog",
    locale: "fa_IR",
    type: "website",
  },
  alternates: {
    canonical: "https://bekhab.ir/blog",
  },
};

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  emoji: string;
}

const POSTS: BlogPost[] = [
  {
    slug: "sleep-hygiene-guide",
    title: "راهنمای جامع بهداشت خواب",
    excerpt:
      "بهداشت خواب مجموعه‌ای از عادت‌ها و شرایط محیطی است که به خواب بهتر کمک می‌کند. در این مقاله ۱۰ اصل طلایی بهداشت خواب را بررسی می‌کنیم.",
    date: "۱۴۰۴/۰۳/۰۱",
    readTime: "۸ دقیقه",
    emoji: "🛏️",
  },
  {
    slug: "4-7-8-breathing",
    title: "تکنیک تنفس ۴-۷-۸: خواب در ۶۰ ثانیه",
    excerpt:
      "دکتر اندرو وایل این تکنیک را «آرام‌بخش طبیعی سیستم عصبی» می‌نامد. یاد بگیرید چطور با تنفس ۴-۷-۸ سریع‌تر بخوابید.",
    date: "۱۴۰۴/۰۲/۲۵",
    readTime: "۵ دقیقه",
    emoji: "🫁",
  },
  {
    slug: "circadian-rhythm",
    title: "ریتم شبانه‌روزی: ساعت درونی بدن شما",
    excerpt:
      "ریتم سیرکادین چگونه کار می‌کند؟ چرا نور آبی خواب را مختل می‌کند؟ نقش ملاتونین و کورتیزول در چرخه خواب-بیداری.",
    date: "۱۴۰۴/۰۲/۱۸",
    readTime: "۱۰ دقیقه",
    emoji: "⏰",
  },
  {
    slug: "white-noise-science",
    title: "علم نویز سفید: چرا صدای یکنواخت خواب‌آور است؟",
    excerpt:
      "تحقیقات علمی نشان می‌دهد نویز سفید و قهوه‌ای می‌تواند زمان به‌خواب‌رفتن را تا ۴۰٪ کاهش دهد. بررسی مکانیزم عصبی آن.",
    date: "۱۴۰۴/۰۲/۱۰",
    readTime: "۷ دقیقه",
    emoji: "🎵",
  },
  {
    slug: "sleep-cycles-explained",
    title: "چرخه‌های خواب: از خواب سبک تا REM",
    excerpt:
      "هر چرخه خواب ۹۰ دقیقه طول می‌کشد و شامل ۴ مرحله است. بدانید کی بیدار شوید تا سرحال باشید.",
    date: "۱۴۰۴/۰۲/۰۳",
    readTime: "۶ دقیقه",
    emoji: "🔄",
  },
  {
    slug: "melatonin-guide",
    title: "راهنمای کامل ملاتونین: دوز، زمان مصرف و عوارض",
    excerpt:
      "ملاتونین هورمون خواب بدن شماست. آیا مصرف مکمل ملاتونین بی‌خطر است؟ دوز مناسب چقدر است؟",
    date: "۱۴۰۴/۰۱/۲۵",
    readTime: "۹ دقیقه",
    emoji: "💊",
  },
];

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-obsidian text-white">
      {/* Header */}
      <header className="pt-8 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors mb-4 inline-block"
          >
            ← بازگشت به بِخواب
          </Link>
          <h1 className="text-3xl font-bold gradient-text mb-3">
            بلاگ خواب 📝
          </h1>
          <p className="text-white/50 text-sm leading-relaxed">
            مقالات علمی و کاربردی درباره بهبود کیفیت خواب، بهداشت خواب و
            آرامش ذهن
          </p>
        </div>
      </header>

      {/* Articles grid */}
      <section className="px-6 pb-16">
        <div className="max-w-2xl mx-auto space-y-4">
          {POSTS.map((post) => (
            <article
              key={post.slug}
              className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="flex gap-4">
                <div className="text-3xl flex-shrink-0 mt-1">
                  {post.emoji}
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-bold text-white/90 mb-2 group-hover:text-indigo-300 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-white/40 leading-relaxed mb-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-white/30">
                    <span>{post.date}</span>
                    <span>·</span>
                    <span>{post.readTime} مطالعه</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <Link
            href="/"
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            بِخواب — بهینه‌سازی خواب ایرانی 🌙
          </Link>
        </div>
      </footer>
    </main>
  );
}
