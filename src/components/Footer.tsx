// Footer.tsx — فوتر — تم آبسیدین
"use client";

import Link from "next/link";
import { FaGithub, FaInstagram, FaTelegram } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full pt-16 pb-6 border-t border-white/5">
      <div className="max-w-content mx-auto px-6 md:px-10">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌙</span>
              <span className="text-lg font-bold text-white">
                بِ<span className="text-indigo-400">خواب</span>
              </span>
            </div>
            <p className="text-xs text-white/30 leading-relaxed">
              اکوسیستم هوشمند بهبود خواب ایرانی
            </p>
            <div className="flex items-center gap-3">
              <SocialIcon
                icon={FaInstagram}
                href="https://instagram.com/bekhab.ir"
                label="اینستاگرام"
              />
              <SocialIcon
                icon={FaTelegram}
                href="https://t.me/bekhab_ir"
                label="تلگرام"
              />
              <SocialIcon
                icon={FaGithub}
                href="https://github.com"
                label="گیت‌هاب"
              />
            </div>
          </div>

          {/* محصول */}
          <div className="flex flex-col gap-3">
            <h4 className="font-medium text-white/80 mb-1 text-sm">محصول</h4>
            <FooterLink href="#sleep">محاسبه‌گر خواب</FooterLink>
            <FooterLink href="#sounds">صداهای آرامش‌بخش</FooterLink>
            <FooterLink href="#breathing">تمرین تنفس</FooterLink>
          </div>

          {/* پشتیبانی */}
          <div className="flex flex-col gap-3">
            <h4 className="font-medium text-white/80 mb-1 text-sm">پشتیبانی</h4>
            <FooterLink href="mailto:info@bekhab.ir">تماس با ما</FooterLink>
            <FooterLink href="#">گزارش مشکل</FooterLink>
            <FooterLink href="#">ارسال بازخورد</FooterLink>
          </div>

          {/* منابع */}
          <div className="flex flex-col gap-3">
            <h4 className="font-medium text-white/80 mb-1 text-sm">منابع</h4>
            <FooterLink href="/blog">بلاگ خواب</FooterLink>
            <FooterLink href="#">سوالات متداول</FooterLink>
            <FooterLink href="#">حریم خصوصی</FooterLink>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 pt-4" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/25">
          <p>
            &copy; {year}، تمامی حقوق محفوظ است.{" "}
            <span className="font-medium text-white/35">
              ساخته شده با 💚 در ایران
            </span>
          </p>
          <p dir="ltr" className="text-white/20">bekhab.ir</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isInternal = href.startsWith("/");
  if (isInternal) {
    return (
      <Link href={href} className="text-sm text-white/30 hover:text-indigo-400 transition-colors">
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className="text-sm text-white/30 hover:text-indigo-400 transition-colors">
      {children}
    </a>
  );
}

function SocialIcon({
  icon: Icon,
  href,
  label,
}: {
  icon: React.ComponentType<{ size?: number }>;
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-8 h-8 flex items-center justify-center rounded-full 
                 bg-white/5 hover:bg-indigo-500/20 text-white/30 hover:text-indigo-400
                 border border-white/5 hover:border-indigo-400/20
                 transition-all duration-300"
    >
      <Icon size={14} />
    </a>
  );
}
