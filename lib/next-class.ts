import { AVAILABLE_DATES_ARRAY, CLASS_TIME_OVERRIDES } from "./constants";

export const DEFAULT_CLASS_TIME = "9:30 AM";

// A class counts as over at 10:30 AM Zurich time on its date. From that
// moment the "Next class" notice rolls over to the following class.
const CLASS_OVER_HOUR = 10;
const CLASS_OVER_MINUTE = 30;

export type NextClass = {
  /** ISO date key, e.g. "2026-09-12" */
  dateKey: string;
  /** e.g. "Saturday, 12.09.2026" */
  label: string;
  /** e.g. "9:30 AM" */
  time: string;
};

function zurichNow(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CH", {
    timeZone: "Europe/Zurich",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00";
  return {
    dateKey: `${get("year")}-${get("month")}-${get("day")}`,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

function formatLabel(dateKey: string) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  const weekday = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    timeZone: "UTC",
  }).format(utc);
  const dd = String(d).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${weekday}, ${dd}.${mm}.${y}`;
}

function nextSaturdayFrom(dateKey: string, includeToday: boolean) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  let daysAhead = (6 - utc.getUTCDay() + 7) % 7; // 6 = Saturday
  if (daysAhead === 0 && !includeToday) daysAhead = 7;
  utc.setUTCDate(utc.getUTCDate() + daysAhead);
  return utc.toISOString().slice(0, 10);
}

/**
 * The next class to show on the homepage. Prefers the bookable dates in
 * AVAILABLE_DATES_ARRAY (so Sunday classes and skipped weekends stay in sync
 * with the booking calendar) and falls back to the next Saturday once that
 * list runs out. Today's class stays "next" until 10:30 AM Zurich time.
 */
export function getNextClass(now: Date = new Date()): NextClass {
  const { dateKey: today, hour, minute } = zurichNow(now);
  const todayIsOver =
    hour > CLASS_OVER_HOUR ||
    (hour === CLASS_OVER_HOUR && minute >= CLASS_OVER_MINUTE);

  const upcoming = [...AVAILABLE_DATES_ARRAY]
    .sort()
    .find((d) => d > today || (d === today && !todayIsOver));

  const dateKey = upcoming ?? nextSaturdayFrom(today, !todayIsOver);
  return {
    dateKey,
    label: formatLabel(dateKey),
    time: CLASS_TIME_OVERRIDES[dateKey] ?? DEFAULT_CLASS_TIME,
  };
}
