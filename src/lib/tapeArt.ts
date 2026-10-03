/** A torn-edge washi-tape strip — a soft gradient fill with a jagged (not perfectly rectangular)
 * left/right edge, so it reads as a real piece of tape rather than a flat colored rectangle.
 * Generated at whatever width/height is needed (the caption background measures the actual
 * caption text first, the sticker icon uses a fixed size), rather than being a fixed-size asset. */
export function tapeStripInner(w: number, h: number, colorA: string, colorB: string): string {
  const notches = 4;
  const step = h / notches;
  const jag = Math.min(7, w * 0.05);
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= notches; i++) {
    const y = i * step;
    const offset = i % 2 === 0 ? 0 : jag;
    left.push(`${offset},${y}`);
  }
  for (let i = notches; i >= 0; i--) {
    const y = i * step;
    const offset = i % 2 === 0 ? 0 : jag;
    right.push(`${w - offset},${y}`);
  }
  const points = [...left, ...right].join(" ");
  return `<defs><linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${colorA}" stop-opacity="0.85"/><stop offset="1" stop-color="${colorB}" stop-opacity="0.85"/></linearGradient></defs><polygon points="${points}" fill="url(#t)" stroke="#4a4f6e" stroke-opacity="0.35" stroke-width="1.5"/>`;
}

export function tapeStripSvg(w: number, h: number, colorA: string, colorB: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${tapeStripInner(w, h, colorA, colorB)}</svg>`;
}

export function tapeStripDataUri(w: number, h: number, colorA: string, colorB: string): string {
  return `data:image/svg+xml,${encodeURIComponent(tapeStripSvg(w, h, colorA, colorB))}`;
}

/** The canvas equivalent of tapeStripInner — draws the same torn-edge jagged strip shape, centered
 * at (cx, cy), optionally rotated (radians), so the caption's tape background in the exported
 * image matches the live preview's SVG version. */
export function drawTapeStrip(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  colorA: string,
  colorB: string,
  rotation = 0,
): void {
  const notches = 4;
  const step = h / notches;
  const jag = Math.min(7, w * 0.05);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.beginPath();
  for (let i = 0; i <= notches; i++) {
    const y = i * step - h / 2;
    const offset = i % 2 === 0 ? 0 : jag;
    const x = offset - w / 2;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let i = notches; i >= 0; i--) {
    const y = i * step - h / 2;
    const offset = i % 2 === 0 ? 0 : jag;
    const x = w / 2 - offset;
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  const gradient = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  gradient.addColorStop(0, colorA);
  gradient.addColorStop(1, colorB);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = "#4a4f6e";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}
