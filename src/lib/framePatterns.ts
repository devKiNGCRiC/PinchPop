export type PatternKind = "stripes" | "diagonal-stripes" | "dots" | "gingham" | "lace";

/** Small tileable SVGs, generated rather than drawn by hand or sourced as image assets — zero
 * cost, zero licensing, and the exact same source can back both the live CSS preview (as a
 * background-image) and the canvas export (loaded as an Image and turned into a CanvasPattern),
 * so the two never drift out of sync.
 *
 * Each tile has a fully transparent background and draws only the semi-opaque foreground shape —
 * so it's meant to be layered as an overlay on top of a frame's own flat color or gradient, rather
 * than being the frame's only color source. That's what lets a frame be both patterned AND a
 * gradient at once. */
function svgDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const TILE = 44;
const DEFAULT_OPACITY = 0.6;

function stripesSvg(color: string, opacity: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}"><rect width="${TILE}" height="${TILE / 2}" fill="${color}" fill-opacity="${opacity}"/></svg>`;
}

/** A candy-cane diagonal stripe, built from one triangle per tile so it tiles seamlessly. */
function diagonalStripesSvg(color: string, opacity: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}"><polygon points="0,0 ${TILE},0 0,${TILE}" fill="${color}" fill-opacity="${opacity}"/></svg>`;
}

function dotsSvg(color: string, opacity: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}"><circle cx="${TILE / 2}" cy="${TILE / 2}" r="${TILE * 0.3}" fill="${color}" fill-opacity="${opacity}"/></svg>`;
}

function ginghamSvg(color: string, opacity: number): string {
  const half = TILE / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}"><rect width="${half}" height="${half}" fill="${color}" fill-opacity="${opacity}"/><rect x="${half}" y="${half}" width="${half}" height="${half}" fill="${color}" fill-opacity="${opacity}"/></svg>`;
}

const LACE_TILE = 88;

/** Two outlined five-petal blossoms with small loops and dots, on an 88px tile so each motif sits
 * fully inside it and the pattern repeats without seams. */
function laceSvg(color: string, opacity: number): string {
  const blossom = (cx: number, cy: number, s: number) =>
    [0, 72, 144, 216, 288]
      .map(
        (a) =>
          `<ellipse cx="${cx}" cy="${cy - 9 * s}" rx="${6 * s}" ry="${9 * s}" transform="rotate(${a} ${cx} ${cy})"/>`,
      )
      .join("") + `<circle cx="${cx}" cy="${cy}" r="${3 * s}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${LACE_TILE * 3}" height="${LACE_TILE * 3}" viewBox="0 0 ${LACE_TILE} ${LACE_TILE}"><g fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1.2">${blossom(22, 22, 1)}${blossom(66, 66, 1)}${blossom(66, 22, 0.55)}${blossom(22, 66, 0.55)}</g><g fill="${color}" fill-opacity="${opacity}"><circle cx="44" cy="44" r="1.6"/><circle cx="44" cy="8" r="1.2"/></g></svg>`;
}

export const PATTERN_TILE_SIZE = TILE;

export function patternDataUri(
  kind: PatternKind,
  color: string,
  opacity = DEFAULT_OPACITY,
): string {
  if (kind === "stripes") return svgDataUri(stripesSvg(color, opacity));
  if (kind === "diagonal-stripes") return svgDataUri(diagonalStripesSvg(color, opacity));
  if (kind === "dots") return svgDataUri(dotsSvg(color, opacity));
  if (kind === "lace") return svgDataUri(laceSvg(color, opacity));
  return svgDataUri(ginghamSvg(color, opacity));
}
