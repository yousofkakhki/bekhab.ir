// sleepMath.ts — منطق محاسبه چرخه خواب
// الهام‌گرفته از: github.com/jfrausto/sleep-calculator

const CYCLE_MINUTES = 90; // هر چرخه REM حدود ۹۰ دقیقه
const FALL_ASLEEP_MINUTES = 15; // زمان تقریبی به خواب رفتن

export interface BedtimeResult {
  /** زمان بیدار شدن (ورودی) */
  wakeTime: string;
  /** لیست زمان‌های پیشنهادی خواب */
  bedtimes: string[];
  /** تعداد چرخه‌ها برای هر زمان پیشنهادی */
  cycles: number[];
  /** مدت خواب تقریبی (ساعت) */
  sleepDurations: number[];
}

/**
 * محاسبه زمان‌های تقریبی خواب بر اساس زمان بیداری
 * @param wakeTime — ساعت بیدار شدن به فرمت "HH:mm"
 * @returns آرایه‌ای از ۴ زمان تقریبی خواب (۶، ۵، ۴ و ۳ چرخه)
 */
export function calculateBedtime(wakeTime: string): BedtimeResult {
  const [hours, minutes] = wakeTime.split(":").map(Number);

  // ساخت تاریخ مبنا
  const wake = new Date();
  wake.setHours(hours, minutes, 0, 0);

  const results: { time: Date; cycles: number; duration: number }[] = [];

  // محاسبه ۴ گزینه: ۶، ۵، ۴ و ۳ چرخه
  for (let numCycles = 6; numCycles >= 3; numCycles--) {
    const totalMinutes = numCycles * CYCLE_MINUTES + FALL_ASLEEP_MINUTES;
    const bedtime = new Date(wake.getTime() - totalMinutes * 60 * 1000);
    results.push({
      time: bedtime,
      cycles: numCycles,
      duration: (numCycles * CYCLE_MINUTES) / 60,
    });
  }

  return {
    wakeTime,
    bedtimes: results.map((r) => formatTime(r.time)),
    cycles: results.map((r) => r.cycles),
    sleepDurations: results.map((r) => r.duration),
  };
}

/**
 * محاسبه زمان بیداری بر اساس زمان خواب
 * @param bedTime — ساعت خواب به فرمت "HH:mm"
 * @returns آرایه‌ای از ۴ زمان بهینه بیداری (۳، ۴، ۵ و ۶ چرخه)
 */
export function calculateWakeTime(bedTime: string): BedtimeResult {
  const [hours, minutes] = bedTime.split(":").map(Number);

  const sleep = new Date();
  sleep.setHours(hours, minutes, 0, 0);

  const results: { time: Date; cycles: number; duration: number }[] = [];

  for (let numCycles = 3; numCycles <= 6; numCycles++) {
    const totalMinutes = numCycles * CYCLE_MINUTES + FALL_ASLEEP_MINUTES;
    const wakeTime = new Date(sleep.getTime() + totalMinutes * 60 * 1000);
    results.push({
      time: wakeTime,
      cycles: numCycles,
      duration: (numCycles * CYCLE_MINUTES) / 60,
    });
  }

  return {
    wakeTime: bedTime,
    bedtimes: results.map((r) => formatTime(r.time)),
    cycles: results.map((r) => r.cycles),
    sleepDurations: results.map((r) => r.duration),
  };
}

/**
 * فرمت ساعت به فارسی
 */
export function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * تبدیل عدد به فارسی
 */
export function toPersianDigits(str: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
}

/**
 * دسته‌بندی مدت خواب
 */
export function getDurationCategory(durationHours: number): "good" | "fair" | "poor" {
  if (durationHours >= 7) return "good";
  if (durationHours >= 6) return "fair";
  return "poor";
}
