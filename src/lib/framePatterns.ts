export type PatternKind = "stripes" | "dots" | "gingham";

/** Small tileable SVGs, generated rather than drawn by hand or sourced as image assets — zero
 * cost, zero licensing, and the exact same source can back both the live CSS preview (as a
 * background-image) and the canvas export (loaded as an Image and turned into a CanvasPattern),
 * so the two never drift out of sync. */
function svgDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const TILE = 28;

function stripesSvg(a: string, b: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}"><rect width="${TILE}" height="${TILE}" fill="${a}"/><rect width="${TILE}" height="${TILE / 2}" fill="${b}"/></svg>`;
}

function dotsSvg(a: string, b: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}"><rect width="${TILE}" height="${TILE}" fill="${a}"/><circle cx="${TILE / 2}" cy="${TILE / 2}" r="${TILE * 0.2}" fill="${b}"/></svg>`;
}

function ginghamSvg(a: string, b: string): string {
  const half = TILE / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}"><rect width="${TILE}" height="${TILE}" fill="${a}"/><rect width="${half}" height="${half}" fill="${b}"/><rect x="${half}" y="${half}" width="${half}" height="${half}" fill="${b}"/></svg>`;
}

export const PATTERN_TILE_SIZE = TILE;

export function patternDataUri(kind: PatternKind, colorA: string, colorB: string): string {
  if (kind === "stripes") return svgDataUri(stripesSvg(colorA, colorB));
  if (kind === "dots") return svgDataUri(dotsSvg(colorA, colorB));
  return svgDataUri(ginghamSvg(colorA, colorB));
}
