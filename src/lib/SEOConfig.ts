// SEOConfig.ts — تنظیمات سئو و JSON-LD برای بخواب
import type { Metadata } from "next";

export const siteConfig = {
  name: "بخواب",
  nameEn: "Bekhab",
  url: "https://bekhab.ir",
  title: "بخواب | راهکار هوشمند بهبود و تنظیم خواب",
  description:
    "تنظیم ساعت بدن، پخش صداهای آرامش‌بخش و آنالیز کیفیت خواب برای رهایی از بی‌خوابی.",
  keywords: [
    "خواب",
    "بی خوابی",
    "صدای آرامش بخش",
    "نویز سفید",
    "چرخه خواب",
    "بهبود خواب",
    "ریتم شبانه روزی",
    "sleep",
    "white noise",
    "sleep calculator",
    "بخواب",
  ],
  locale: "fa_IR",
  themeColor: "#020617",
};

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

/** JSON-LD: SoftwareApplication */
export function generateSoftwareAppJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    url: siteConfig.url,
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    inLanguage: "fa",
    description: siteConfig.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IRR",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.7",
      ratingCount: "320",
      bestRating: "5",
    },
  };
}

/** JSON-LD: WebApplication as HealthPlan */
export function generateHealthPlanJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${siteConfig.name} - برنامه بهبود خواب`,
    url: siteConfig.url,
    description: siteConfig.description,
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    softwareVersion: "2.0.0",
    applicationCategory: "HealthApplication",
    applicationSubCategory: "SleepTracker",
    inLanguage: "fa",
    isAccessibleForFree: true,
    featureList: [
      "محاسبه چرخه خواب بر اساس REM",
      "پخش صداهای آرامش‌بخش",
      "ردیابی کیفیت خواب",
      "تمرین تنفس ۴-۷-۸",
      "محافظ دوپامین شبانه",
    ],
  };
}

/** JSON-LD: FAQPage for SEO */
export function generateFaqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "چطور زمان مناسب خواب را محاسبه کنم؟",
        acceptedAnswer: {
          "@type": "Answer",
          text: "بخواب بر اساس چرخه‌های ۹۰ دقیقه‌ای خواب REM، بهترین زمان خوابیدن را محاسبه می‌کند. کافیست زمان بیداری خود را وارد کنید.",
        },
      },
      {
        "@type": "Question",
        name: "آیا صداهای آرامش‌بخش واقعاً به خواب بهتر کمک می‌کنند؟",
        acceptedAnswer: {
          "@type": "Answer",
          text: "تحقیقات نشان می‌دهد نویز سفید و صداهای طبیعی می‌توانند زمان به خواب رفتن را کاهش و کیفیت خواب را بهبود دهند.",
        },
      },
      {
        "@type": "Question",
        name: "تنفس ۴-۷-۸ چیست؟",
        acceptedAnswer: {
          "@type": "Answer",
          text: "یک تکنیک تنفسی که شامل ۴ ثانیه دم، ۷ ثانیه نگه‌داشتن و ۸ ثانیه بازدم است. این تکنیک توسط دکتر اندرو ویل معرفی شده و به آرامش سیستم عصبی کمک می‌کند.",
        },
      },
    ],
  };
}
