/** A ribbon/banner shape with custom text baked in — for labels like "My Love" or "Best Day",
 * matching the labeled-tag decorations in scrapbook-style polaroid references. Uses a generic
 * serif font rather than one of the app's own webfonts: an SVG rendered as an image (the live
 * preview's <img> path) can't see the page's own @font-face rules, so a generic family is the
 * only choice guaranteed to render the same way everywhere — the canvas export deliberately uses
 * the exact same font string so the two never look different from each other. */
const BANNER_FONT = `Georgia, "Times New Roman", serif`;
export const BANNER_BG: [string, string] = ["#fdf6f8", "#f4e3ea"];
export const BANNER_TEXT_COLOR = "#6e4f5c";
export const BANNER_ASPECT = 220 / 70;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function bannerSvg(text: string, w = 220, h = 70): string {
  const notch = h * 0.3;
  const points = `0,${h / 2} ${notch},0 ${w - notch},0 ${w},${h / 2} ${w - notch},${h} ${notch},${h}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs><linearGradient id="bn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${BANNER_BG[0]}"/><stop offset="1" stop-color="${BANNER_BG[1]}"/></linearGradient></defs><polygon points="${points}" fill="url(#bn)" stroke="#b9a3ad" stroke-width="1.5"/><text x="${w / 2}" y="${h / 2 + h * 0.12}" text-anchor="middle" font-family='${BANNER_FONT}' font-size="${h * 0.36}" font-weight="700" fill="${BANNER_TEXT_COLOR}">${escapeXml(text)}</text></svg>`;
}

export function bannerDataUri(text: string, w = 220, h = 70): string {
  return `data:image/svg+xml,${encodeURIComponent(bannerSvg(text, w, h))}`;
}

export function drawBannerOnCanvas(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  w: number,
  h: number,
): void {
  const notch = h * 0.3;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  ctx.lineTo(-w / 2 + notch, -h / 2);
  ctx.lineTo(w / 2 - notch, -h / 2);
  ctx.lineTo(w / 2, 0);
  ctx.lineTo(w / 2 - notch, h / 2);
  ctx.lineTo(-w / 2 + notch, h / 2);
  ctx.closePath();
  const gradient = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  gradient.addColorStop(0, BANNER_BG[0]);
  gradient.addColorStop(1, BANNER_BG[1]);
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = "#b9a3ad";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = BANNER_TEXT_COLOR;
  ctx.font = `700 ${Math.round(h * 0.36)}px ${BANNER_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, h * 0.06);
  ctx.restore();
}
