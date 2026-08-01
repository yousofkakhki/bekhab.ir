// SEOConfig.ts — تنظیمات سئو و JSON-LD برای بخواب
import type { Metadata } from "next";

export const siteConfig = {
  name: "بخواب",
  nameEn: "Bekhab",
  url: "https://bekhab.ir",
  title: "بخواب | ابزار آرامش و برنامه‌ریزی خواب",
  description:
    "محاسبه تقریبی زمان خواب، ترکیب صداهای طبیعی، راهنمای تنفس زمان‌بندی‌شده و ثبت حرکت شبانه.",
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
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Web",
    inLanguage: "fa",
    description: siteConfig.description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "IRR",
    },
  };
}

/** JSON-LD: WebApplication */
export function generateWebAppJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${siteConfig.name} - ابزار برنامه‌ریزی خواب`,
    url: siteConfig.url,
    description: siteConfig.description,
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    applicationCategory: "LifestyleApplication",
    inLanguage: "fa",
    isAccessibleForFree: true,
    featureList: [
      "محاسبه تقریبی زمان خواب",
      "پخش صداهای آرامش‌بخش",
      "ثبت حرکت شبانه روی دستگاه",
      "راهنمای تنفس ۴-۷-۸",
    ],
  };
}
