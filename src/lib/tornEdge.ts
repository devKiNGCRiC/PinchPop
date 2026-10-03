const SEGMENTS_PER_SIDE = 9;
const JAG = 0.022;

/** Deterministic "hand-torn paper" jitter — a sum of two sine waves rather than real randomness,
 * so the same ragged edge renders identically in the live preview, the picker swatch and the
 * canvas export every time. */
function wobble(i: number): number {
  return JAG * (Math.sin(i * 2.1) * 0.6 + Math.sin(i * 5.3 + 1.3) * 0.4);
}

/** A ragged rectangle outline as fractions (0..1) of a box's own width/height, walking clockwise
 * from the top-left — used for both the CSS clip-path and the canvas clip/stroke path so the
 * live preview and the exported PNG always match. */
function tornEdgePoints(): [number, number][] {
  const pts: [number, number][] = [];
  let i = 0;
  for (let s = 0; s <= SEGMENTS_PER_SIDE; s++, i++) {
    pts.push([s / SEGMENTS_PER_SIDE, wobble(i)]);
  }
  for (let s = 1; s <= SEGMENTS_PER_SIDE; s++, i++) {
    pts.push([1 + wobble(i), s / SEGMENTS_PER_SIDE]);
  }
  for (let s = 1; s <= SEGMENTS_PER_SIDE; s++, i++) {
    pts.push([1 - s / SEGMENTS_PER_SIDE, 1 + wobble(i)]);
  }
  for (let s = 1; s < SEGMENTS_PER_SIDE; s++, i++) {
    pts.push([wobble(i), 1 - s / SEGMENTS_PER_SIDE]);
  }
  return pts;
}

const TORN_EDGE_POINTS = tornEdgePoints();

export function tornEdgeClipPath(): string {
  return `polygon(${TORN_EDGE_POINTS.map(([x, y]) => `${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`).join(", ")})`;
}

/** Same outline as `tornEdgeClipPath`, as an SVG `points` string on a 0-100 viewBox — used to
 * stroke a ragged border on top of the clipped photo (a CSS `border` can't follow a clip-path). */
export function tornEdgeSvgPoints(): string {
  return TORN_EDGE_POINTS.map(([x, y]) => `${(x * 100).toFixed(2)},${(y * 100).toFixed(2)}`).join(
    " ",
  );
}

/** Traces the same ragged outline on a canvas context, scaled to a box at (x,y,w,h). The caller
 * decides what to do with the open path (`ctx.clip()`, `ctx.stroke()`, or both). */
export function traceTornEdge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.beginPath();
  TORN_EDGE_POINTS.forEach(([px, py], i) => {
    const cx = x + px * w;
    const cy = y + py * h;
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  });
  ctx.closePath();
}
