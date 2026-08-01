import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "منابع معتبر خواب | بِخواب",
  description:
    "پیوند به منابع معتبر و عمومی درباره خواب، کم‌خوابی و بی‌خوابی از CDC، NHLBI و NHS.",
  openGraph: {
    title: "منابع معتبر خواب | بِخواب",
    description: "منابع عمومی و معتبر برای مطالعه بیشتر درباره خواب",
    url: "https://bekhab.ir/blog",
    locale: "fa_IR",
    type: "website",
  },
  alternates: {
    canonical: "https://bekhab.ir/blog",
  },
};

const RESOURCES = [
  {
    href: "https://www.cdc.gov/sleep/about/index.html",
    title: "درباره خواب",
    description: "اطلاعات عمومی درباره خواب و عادت‌های خواب از مرکز کنترل و پیشگیری بیماری‌های آمریکا.",
    source: "CDC",
    emoji: "🌙",
  },
  {
    href: "https://www.nhlbi.nih.gov/health/sleep-deprivation",
    title: "کم‌خوابی و محرومیت از خواب",
    description: "مروری بر کم‌خوابی، نشانه‌ها و زمان مراجعه برای دریافت راهنمایی تخصصی.",
    source: "NHLBI",
    emoji: "⏰",
  },
  {
    href: "https://www.nhs.uk/conditions/insomnia/",
    title: "بی‌خوابی",
    description: "راهنمای عمومی سرویس سلامت بریتانیا درباره بی‌خوابی و دریافت کمک حرفه‌ای.",
    source: "NHS",
    emoji: "🛏️",
  },
] as const;

export default function ResourcesPage() {
  return (
    <main className="min-h-screen bg-obsidian text-white">
      <header className="px-6 pb-12 pt-8">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/"
            className="mb-4 inline-block text-sm text-indigo-400 transition-colors hover:text-indigo-300"
          >
            ← بازگشت به بِخواب
          </Link>
          <h1 className="gradient-text mb-3 text-3xl font-bold">
            منابع معتبر خواب
          </h1>
          <p className="text-sm leading-relaxed text-white/50">
            برای مطالعه بیشتر، از منابع عمومی و معتبر زیر استفاده کنید. این
            پیوندها جایگزین تشخیص یا توصیه پزشکی نیستند.
          </p>
        </div>
      </header>

      <section className="px-6 pb-16" aria-label="منابع خواب">
        <div className="mx-auto max-w-2xl space-y-4">
          {RESOURCES.map((resource) => (
            <article key={resource.href}>
              <a
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                className="glass group flex gap-4 rounded-2xl p-6 transition-all duration-300 hover:bg-white/10"
              >
                <span className="mt-1 flex-shrink-0 text-3xl" aria-hidden="true">
                  {resource.emoji}
                </span>
                <span className="flex-1">
                  <span className="mb-2 block text-base font-bold text-white/90 transition-colors group-hover:text-indigo-300">
                    {resource.title}
                  </span>
                  <span className="mb-3 block text-sm leading-relaxed text-white/40">
                    {resource.description}
                  </span>
                  <span className="text-xs text-indigo-300">
                    مطالعه در {resource.source} ↗
                  </span>
                </span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-8">
        <div className="mx-auto max-w-2xl text-center">
          <Link
            href="/"
            className="text-sm text-indigo-400 transition-colors hover:text-indigo-300"
          >
            بِخواب — ابزارهای آرامش و برنامه‌ریزی خواب 🌙
          </Link>
        </div>
      </footer>
    </main>
  );
}