// Header.tsx — نوار ناوبری بالا
// تم آبسیدین — شیشه‌ای شفاف
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function Header() {
  const [isPinned, setIsPinned] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsPinned(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-0 w-full" aria-hidden="true" />
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isPinned ? "py-2 px-4" : "py-4 px-6"
        }`}
      >
        <div
          className={`max-w-content mx-auto flex items-center gap-4 transition-all duration-300 ${
            isPinned
              ? "glass rounded-2xl shadow-2xl px-6 py-3"
              : "bg-transparent px-2 py-2"
          }`}
        >
          {/* لوگو */}
          <Link href="/" className="flex items-center gap-2 group" aria-label="صفحه اصلی">
            <span className="text-2xl">🌙</span>
            <span className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
              بِ<span className="text-indigo-400">خواب</span>
            </span>
          </Link>

          <div className="flex-1" />

          {/* پیوندها */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="#sleep">محاسبه خواب</NavLink>
            <NavLink href="#sounds">صداها</NavLink>
            <NavLink href="#breathing">تنفس</NavLink>
            <NavLink href="/blog">منابع</NavLink>
          </nav>

          {/* دکمه CTA */}
          <a
            href="#sounds"
            className="px-5 py-2 text-sm font-medium text-white bg-indigo-500/20 
                       hover:bg-indigo-500/30 border border-indigo-400/30 
                       rounded-full transition-all duration-300"
          >
            شروع کنید
          </a>
        </div>
      </header>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const isExternal = href.startsWith("/");
  const Component = isExternal ? Link : "a";
  return (
    <Component
      href={href}
      className="px-4 py-2 text-sm font-medium text-white/50 hover:text-indigo-300 
                 rounded-full transition-colors"
    >
      {children}
    </Component>
  );
}
