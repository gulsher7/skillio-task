const pad = (n: number) => String(n).padStart(2, '0');

const DAY_MS = 86400000;

export function atDayOffset(dayOffset: number, hour: number, minute: number) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/** ISO without the timezone suffix, so it reads back as local wall-clock time. */
export function toLocalIso(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}:00`;
}

export function formatTime(d: Date) {
  const suffix = d.getHours() >= 12 ? 'PM' : 'AM';
  const hour = d.getHours() % 12 || 12;
  return `${hour}:${pad(d.getMinutes())} ${suffix}`;
}

/** Days from today: 0 is today, 1 is tomorrow, anything else gets a weekday. */
export function daysFromToday(d: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

export function weekdayShort(d: Date, locale: string) {
  return d.toLocaleDateString(locale, { weekday: 'short' });
}

export function monthShort(d: Date, locale: string) {
  return d.toLocaleDateString(locale, { month: 'short' });
}

/** Returns a locale key, not a phrase — the caller translates it. */
export function greetingKey(now = new Date()): 'morning' | 'afternoon' | 'evening' {
  const hour = now.getHours();
  if (hour < 5) return 'evening';
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}m ${pad(seconds % 60)}s`;
}

/** Weekday initials for the last 7 days, oldest first. */
export function lastSevenDays(locale: string) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d.toLocaleDateString(locale, { weekday: 'short' }).slice(0, 2);
  });
}
