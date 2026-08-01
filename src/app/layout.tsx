import type { Viewport } from "next";
import localFont from "next/font/local";
import {
  baseMetadata,
  generateSoftwareAppJsonLd,
  generateWebAppJsonLd,
  generateFaqJsonLd,
} from "@/lib/SEOConfig";
import "./globals.css";

const vazirmatn = localFont({
  src: [
    { path: "../../public/fonts/vazirmatn/Vazirmatn-100.ttf", weight: "100" },
    { path: "../../public/fonts/vazirmatn/Vazirmatn-200.ttf", weight: "200" },
    { path: "../../public/fonts/vazirmatn/Vazirmatn-300.ttf", weight: "300" },
    { path: "../../public/fonts/vazirmatn/Vazirmatn-400.ttf", weight: "400" },
    { path: "../../public/fonts/vazirmatn/Vazirmatn-500.ttf", weight: "500" },
    { path: "../../public/fonts/vazirmatn/Vazirmatn-600.ttf", weight: "600" },
    { path: "../../public/fonts/vazirmatn/Vazirmatn-700.ttf", weight: "700" },
    { path: "../../public/fonts/vazirmatn/Vazirmatn-800.ttf", weight: "800" },
    { path: "../../public/fonts/vazirmatn/Vazirmatn-900.ttf", weight: "900" },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata = baseMetadata;

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateSoftwareAppJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateWebAppJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateFaqJsonLd()),
          }}
        />
      </head>
      <body className={`${vazirmatn.variable} font-vazir antialiased bg-obsidian`}>
        {children}
      </body>
    </html>
  );
}
