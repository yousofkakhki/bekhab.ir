// sound-config.ts — صداهای بِخواب
// مجموعه‌ای از صداهای آرامش‌بخش با الهام از طبیعت ایران

export interface SoundConfig {
  id: string;
  name: string;
  icon: string; // emoji icon
  /** URL or path to the audio file (loopable) */
  src: string;
  /** Default volume 0–1 */
  defaultVolume: number;
  /** Color accent for active glow */
  color: string;
  /** Short Farsi description */
  description: string;
}

export const SOUNDS: SoundConfig[] = [
  {
    id: "tehran-rain",
    name: "باران تهران",
    icon: "🌧️",
    src: "/sounds/rain.mp3",
    defaultVolume: 0.5,
    color: "#818cf8", // indigo-400
    description: "صدای باران بر بام‌های تهران",
  },
  {
    id: "caspian-waves",
    name: "امواج خزر",
    icon: "🌊",
    src: "/sounds/ocean.mp3",
    defaultVolume: 0.45,
    color: "#22d3ee", // cyan-400
    description: "موج‌های آرام دریای خزر",
  },
  {
    id: "brown-noise",
    name: "نویز قهوه‌ای",
    icon: "🎵",
    src: "/sounds/brown-noise.mp3",
    defaultVolume: 0.35,
    color: "#a78bfa", // violet-400
    description: "نویز عمیق برای تمرکز و خواب",
  },
  {
    id: "soft-setar",
    name: "سه‌تار آرام",
    icon: "🪕",
    src: "/sounds/setar.mp3",
    defaultVolume: 0.3,
    color: "#f59e0b", // amber-500
    description: "ملودی آرام سه‌تار ایرانی",
  },
  {
    id: "fireplace",
    name: "آتش بخاری",
    icon: "🔥",
    src: "/sounds/fire.mp3",
    defaultVolume: 0.4,
    color: "#f97316", // orange-500
    description: "صدای ترق‌ترق آتش",
  },
  {
    id: "night-crickets",
    name: "جیرجیرک شب",
    icon: "🦗",
    src: "/sounds/crickets.mp3",
    defaultVolume: 0.3,
    color: "#34d399", // emerald-400
    description: "جیرجیرک‌های شب‌های ییلاقی",
  },
  {
    id: "wind",
    name: "باد کویر",
    icon: "💨",
    src: "/sounds/wind.mp3",
    defaultVolume: 0.35,
    color: "#94a3b8", // slate-400
    description: "وزش ملایم باد در دشت",
  },
  {
    id: "thunder",
    name: "رعد و برق",
    icon: "⛈️",
    src: "/sounds/thunder.mp3",
    defaultVolume: 0.4,
    color: "#c084fc", // purple-400
    description: "رعد و برق دوردست",
  },
  {
    id: "white-noise",
    name: "نویز سفید",
    icon: "📻",
    src: "/sounds/white-noise.mp3",
    defaultVolume: 0.3,
    color: "#e2e8f0", // slate-200
    description: "نویز یکنواخت برای تمرکز",
  },
  {
    id: "fan",
    name: "پنکه",
    icon: "🌀",
    src: "/sounds/fan.mp3",
    defaultVolume: 0.35,
    color: "#67e8f9", // cyan-300
    description: "صدای یکنواخت پنکه سقفی",
  },
  {
    id: "birds",
    name: "پرندگان صبح",
    icon: "🐦",
    src: "/sounds/birds.mp3",
    defaultVolume: 0.3,
    color: "#86efac", // green-300
    description: "آواز پرندگان هنگام سحر",
  },
  {
    id: "river",
    name: "رودخانه",
    icon: "🏞️",
    src: "/sounds/river.mp3",
    defaultVolume: 0.4,
    color: "#38bdf8", // sky-400
    description: "جریان آرام رودخانه در جنگل",
  },
];
