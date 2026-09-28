/**
 * The brief hands us `user.avatarUrl` as a string, so we keep it a string: an
 * illustrated SVG encoded as a data URI, decoded at render time by <Avatar />.
 * Nothing here hits the network.
 */
const toDataUri = (svg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;

const studentSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <linearGradient id="a" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFD978"/><stop offset="1" stop-color="#FFB547"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" fill="url(#a)"/>
  <path d="M12 64c2-12 10-18 20-18s18 6 20 18z" fill="#0C2A33"/>
  <circle cx="32" cy="30" r="13" fill="#C98B62"/>
  <path d="M18 28c0-10 6-15 14-15s15 4 14 14c-3-4-9-6-14-6-6 0-10 3-14 7z" fill="#2B1B14"/>
  <circle cx="27" cy="31" r="1.7" fill="#2B1B14"/>
  <circle cx="37" cy="31" r="1.7" fill="#2B1B14"/>
  <path d="M28 37q4 3 8 0" stroke="#2B1B14" stroke-width="1.8" fill="none" stroke-linecap="round"/>
</svg>`;

const teacherSvg = (bg: string, skin: string, hair: string) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="32" fill="${bg}"/>
  <path d="M12 64c2-12 10-18 20-18s18 6 20 18z" fill="#ffffff" opacity=".9"/>
  <path d="M16 40c-2-18 6-27 16-27s18 9 16 27z" fill="${hair}"/>
  <circle cx="32" cy="30" r="12" fill="${skin}"/>
  <path d="M20 27c2-8 7-11 12-11s11 3 12 11c-5-3-11-5-24 0z" fill="${hair}"/>
  <circle cx="27.5" cy="31" r="1.6" fill="#2B1B14"/>
  <circle cx="36.5" cy="31" r="1.6" fill="#2B1B14"/>
  <path d="M28.5 36q3.5 2.6 7 0" stroke="#2B1B14" stroke-width="1.7" fill="none" stroke-linecap="round"/>
</svg>`;

export const STUDENT_AVATAR = toDataUri(studentSvg);

export const TEACHERS = {
  sarah: {
    name: 'Sarah Williams',
    avatarUrl: toDataUri(teacherSvg('#CDEEF1', '#F1C7A6', '#8A5A3B')),
  },
  james: {
    name: 'James Carter',
    avatarUrl: toDataUri(teacherSvg('#EFEDFE', '#8D5B3E', '#1E1510')),
  },
  priya: {
    name: 'Priya Nair',
    avatarUrl: toDataUri(teacherSvg('#FFF6DD', '#C68A62', '#231815')),
  },
} as const;

export type TeacherId = keyof typeof TEACHERS;

export const teacherByName = (name?: string) =>
  Object.values(TEACHERS).find((t) => t.name === name) ?? TEACHERS.sarah;
