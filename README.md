# 🌙 بِخواب (Bekhab) — Sleep Optimization PWA

> **بهینه‌سازی خواب برای بازار ایران**

یک اپلیکیشن تحت وب (PWA) که به کاربران کمک می‌کند زمان مناسب خواب را محاسبه کنند و با صداهای آرامش‌بخش بهتر بخوابند.

## ✨ ویژگی‌ها

- **⏰ محاسبه‌گر خواب** — بر اساس چرخه‌های ۹۰ دقیقه‌ای REM، بهترین زمان خواب را پیشنهاد می‌دهد
- **🎵 میکسر صدا** — پخش همزمان چندین صدای طبیعی (باران، آتش، نویز سفید و...)
- **🌙 حالت تمرکز** — صفحه سیاه با پخش ادامه‌دار صدا
- **💾 ذخیره ترکیب** — ترکیب مورد علاقه صداها در LocalStorage ذخیره می‌شود
- **🇮🇷 کاملاً فارسی** — تمام متن‌ها و اعداد به فارسی
- **📱 PWA** — قابل نصب روی موبایل

## 🛠️ تکنولوژی‌ها

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (RTL support)
- **Zustand** (state management)
- **Vazirmatn** (Persian font)

## 🚀 شروع سریع

```bash
npm install
npm run dev
npm run build
```

## 📁 ساختار پروژه

```
src/
├── app/
│   ├── layout.tsx          # RTL layout + Vazirmatn font
│   ├── page.tsx            # صفحه اصلی
│   └── globals.css         # استایل‌های سراسری
├── components/
│   ├── Header.tsx          # هدر اپلیکیشن
│   ├── SleepCalculator.tsx # ماشین حساب خواب
│   ├── SoundGrid.tsx       # شبکه کارت‌های صدا
│   ├── GlobalControls.tsx  # کنترل‌های سراسری پخش
│   ├── FocusMode.tsx       # حالت تمرکز (صفحه سیاه)
│   └── WarningCard.tsx     # هشدار خواب ناکافی + افیلیت
├── hooks/
│   └── useAudioMixer.ts    # هوک موتور صدا
├── lib/
│   ├── sleepMath.ts        # منطق محاسبه چرخه خواب
│   └── sound-config.ts     # تنظیمات صداها
└── store/
    └── audioStore.ts       # Zustand store
```

## 📝 افزودن صداها

فایل‌های MP3 را در `public/sounds/` قرار دهید:
- rain.mp3, fire.mp3, white-noise.mp3, fan.mp3
- ocean.mp3, birds.mp3, thunder.mp3, wind.mp3

## 💰 لینک‌های افیلیت

هنگامی که کاربر زمان خوابی کمتر از ۶ ساعت محاسبه می‌کند، کارت هشدار با لینک‌های افیلیت نمایش داده می‌شود.

## 📜 الهام

- موتور صدا: [trynoice/web-app-v0](https://github.com/trynoice/web-app-v0)
- منطق خواب: [jfrausto/sleep-calculator](https://github.com/jfrausto/sleep-calculator)
