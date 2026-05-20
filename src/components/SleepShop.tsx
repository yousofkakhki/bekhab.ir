// SleepShop.tsx — فروشگاه خواب (افیلیت)
"use client";

const persianDigits = (n: number | string) => {
  const digits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return n.toString().replace(/[0-9]/g, (d) => digits[parseInt(d)]);
};

interface Product {
  id: string;
  name: string;
  description: string;
  price: string; // formatted price
  icon: string;
  link: string;
  badge?: string;
  category: "bedding" | "gadget" | "supplement" | "accessory";
}

const PRODUCTS: Product[] = [
  {
    id: "melatonin",
    name: "قرص ملاتونین ۳ میلی‌گرم",
    description: "تنظیم ریتم شبانه‌روزی به صورت طبیعی",
    price: persianDigits("۱۸۵,۰۰۰"),
    icon: "💊",
    link: "#",
    badge: "پرفروش",
    category: "supplement",
  },
  {
    id: "sleep-mask",
    name: "چشم‌بند خواب ابریشمی",
    description: "مسدود‌کننده نور ۱۰۰٪ با بند قابل تنظیم",
    price: persianDigits("۱۲۰,۰۰۰"),
    icon: "😎",
    link: "#",
    category: "accessory",
  },
  {
    id: "pillow",
    name: "بالش مموری فوم ارتوپدی",
    description: "پشتیبانی مناسب گردن، ضد حساسیت",
    price: persianDigits("۴۵۰,۰۰۰"),
    icon: "🛏️",
    link: "#",
    badge: "پیشنهاد ویژه",
    category: "bedding",
  },
  {
    id: "earplugs",
    name: "گوش‌گیر خواب سیلیکونی",
    description: "کاهش ۳۲ دسی‌بل نویز محیط",
    price: persianDigits("۸۵,۰۰۰"),
    icon: "🔇",
    link: "#",
    category: "accessory",
  },
  {
    id: "magnesium",
    name: "مکمل منیزیم گلایسینات",
    description: "آرام‌سازی عضلات و بهبود کیفیت خواب",
    price: persianDigits("۲۲۰,۰۰۰"),
    icon: "✨",
    link: "#",
    category: "supplement",
  },
  {
    id: "night-light",
    name: "چراغ خواب نور گرم",
    description: "نور ۲۷۰۰K مناسب ریتم سیرکادین",
    price: persianDigits("۲۸۰,۰۰۰"),
    icon: "🕯️",
    link: "#",
    category: "gadget",
  },
];

export default function SleepShop() {
  return (
    <section className="py-12">
      <h2 className="text-xl font-bold text-white/90 text-center mb-2">
        🛒 فروشگاه خواب
      </h2>
      <p className="text-sm text-white/40 text-center mb-8 max-w-md mx-auto">
        محصولات منتخب برای بهبود کیفیت خواب شما
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
        {PRODUCTS.map((product) => (
          <a
            key={product.id}
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="glass rounded-2xl p-4 hover:bg-white/10 transition-all duration-300 group relative block"
          >
            {/* Badge */}
            {product.badge && (
              <span className="absolute -top-2 -right-2 bg-indigo-500/80 text-white text-[10px] px-2 py-0.5 rounded-full">
                {product.badge}
              </span>
            )}

            {/* Icon */}
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
              {product.icon}
            </div>

            {/* Name */}
            <h3 className="text-sm font-medium text-white/90 mb-1 leading-snug">
              {product.name}
            </h3>

            {/* Description */}
            <p className="text-[10px] text-white/40 mb-3 leading-relaxed">
              {product.description}
            </p>

            {/* Price */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-indigo-300 font-medium">
                {product.price} تومان
              </span>
              <span className="text-[10px] text-white/20 group-hover:text-white/40 transition-colors">
                مشاهده ←
              </span>
            </div>
          </a>
        ))}
      </div>

      <p className="text-[10px] text-white/15 text-center mt-6">
        بِخواب از فروش این محصولات کمیسیون دریافت می‌کند
      </p>
    </section>
  );
}
