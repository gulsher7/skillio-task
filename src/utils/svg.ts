/** Turns the `data:image/svg+xml,…` strings in our payload back into markup. */
export function svgFromDataUri(uri?: string | null): string | null {
  if (!uri || !uri.startsWith('data:image/svg+xml')) return null;
  const comma = uri.indexOf(',');
  if (comma < 0) return null;

  const meta = uri.slice(0, comma);
  const payload = uri.slice(comma + 1);
  try {
    return meta.includes(';base64') ? atob(payload) : decodeURIComponent(payload);
  } catch {
    return null;
  }
}

export function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
