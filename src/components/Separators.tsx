// Separators.tsx — جداکننده‌های ظریف — تم آبسیدین
"use client";

export function GlowSeparator() {
  return (
    <div className="w-full flex justify-center py-8" aria-hidden="true">
      <div className="w-32 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
    </div>
  );
}

export function DotSeparator() {
  return (
    <div className="w-full flex justify-center items-center gap-2 py-6" aria-hidden="true">
      <div className="w-1 h-1 rounded-full bg-white/10" />
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400/30" />
      <div className="w-1 h-1 rounded-full bg-white/10" />
    </div>
  );
}
