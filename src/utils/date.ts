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

export function dayLabel(d: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  const days = Math.round((target.getTime() - today.getTime()) / DAY_MS);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return target.toLocaleDateString('en-US', { weekday: 'short' });
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return 'Good evening';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}m ${pad(seconds % 60)}s`;
}

/** Weekday initials for the last 7 days, oldest first. */
export function lastSevenDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);
  });
}

export const formatNumber = (n: number) => new Intl.NumberFormat('en-US').format(n);
