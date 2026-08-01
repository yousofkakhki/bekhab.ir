// page.tsx — صفحه اصلی بِخواب — تم آبسیدین
"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SleepCalculator from "@/components/SleepCalculator";
import SoundGrid from "@/components/SoundGrid";
import BreathingCircle from "@/components/BreathingCircle";
import SleepReport from "@/components/SleepReport";
import Footer from "@/components/Footer";
import GlobalControls from "@/components/GlobalControls";
import { FocusModeButton, FocusModeOverlay } from "@/components/FocusMode";
import { GlowSeparator, DotSeparator } from "@/components/Separators";

export default function Home() {
  const [isFocusMode, setIsFocusMode] = useState(false);

  if (isFocusMode) {
    return <FocusModeOverlay onExit={() => setIsFocusMode(false)} />;
  }

  return (
    <main className="min-h-screen bg-obsidian text-white relative overflow-hidden">
        {/* Night overlay gradient */}
        <div className="night-overlay" />


        {/* دکمه حالت تمرکز */}
        <FocusModeButton onClick={() => setIsFocusMode(true)} />

        {/* نوار ناوبری */}
        <Header />

        {/* هیرو */}
        <Hero />

        <GlowSeparator />

        {/* محاسبه‌گر خواب */}
        <SleepCalculator />

        <DotSeparator />

        {/* صداها */}
        <SoundGrid />

        <GlowSeparator />

        {/* تنفس ۴-۷-۸ */}
        <div id="breathing">
          <BreathingCircle />
        </div>

        <DotSeparator />

        {/* گزارش خواب */}
        <SleepReport />

        {/* فوتر */}
        <Footer />

        {/* کنترل‌های سراسری پخش */}
        <GlobalControls />
    </main>
  );
}
