/** Lightens (amt > 0) or darkens (amt < 0) a #rrggbb color — used to build a subtle two-tone
 * gradient from a single base color, rather than needing a second color picked by hand everywhere
 * one is needed. */
export function lighten(hex: string, amt: number): string {
  const num = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  const r = clamp((num >> 16) + Math.round(255 * amt));
  const g = clamp(((num >> 8) & 0xff) + Math.round(255 * amt));
  const b = clamp((num & 0xff) + Math.round(255 * amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
