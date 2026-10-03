import { createElement } from "react";

import { Art } from "@/components/Art";
import { getArt } from "@/lib/art";
import { drawBannerOnCanvas } from "@/lib/bannerArt";
import { lighten } from "@/lib/color";
import type { FramePreset } from "@/lib/frames";
import { patternDataUri } from "@/lib/framePatterns";
import type { Memory } from "@/lib/memories";
import { formatAccuracy, formatTime } from "@/lib/puzzle";
import { formatDate } from "@/lib/stats";
import { stickerIconDataUri } from "@/lib/stickerIcons";
import type { PlacedSticker } from "@/lib/stickers";
import { drawTapeStrip } from "@/lib/tapeArt";
import { traceTornEdge } from "@/lib/tornEdge";

const INK = "#111426";
const IVORY = "#fff6e6";
const MARIGOLD = "#ffc61a";
/** Export's caption-size baseline: the live preview's default 26px caption maps to 84px on the
 * fixed 880-wide export canvas — preserves the exact scale this was already tuned at. */
const CAPTION_SCALE = 84 / 26;

interface Picture {
  image: HTMLImageElement;
  /** Width divided by height, clamped so extreme frames still make a good print. */
  aspect: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the picture for export."));
    image.src = src;
  });
}

/** The picture of a run: its camera photo, or its destination illustration drawn from the SVG. */
async function pictureOf(memory: Memory): Promise<Picture> {
  if (memory.photo) {
    const image = await loadImage(memory.photo);
    return { image, aspect: Math.min(1.4, Math.max(0.75, memory.aspect ?? 1)) };
  }
  const { renderToStaticMarkup } = await import("react-dom/server");
  const markup = renderToStaticMarkup(
    createElement(Art, { artId: memory.artId, decorative: true }),
  ).replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900"');
  const url = URL.createObjectURL(new Blob([markup], { type: "image/svg+xml" }));
  try {
    return { image: await loadImage(url), aspect: 1 };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function ensureFonts(): Promise<void> {
  if (!("fonts" in document)) return;
  await Promise.all([
    document.fonts.load('700 72px "Caveat"'),
    document.fonts.load('700 72px "Dancing Script"'),
    document.fonts.load('700 72px "Playfair Display"'),
    document.fonts.load('600 34px "Bricolage Grotesque"'),
    document.fonts.load('800 32px "Unbounded"'),
  ]).catch(() => undefined);
}

function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not create the image."))),
      "image/png",
    ),
  );
}

function makeCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  // The saved photo is often smaller than the fixed print size below, so this draw is usually an
  // upscale — the default "low" smoothing browsers use for that looks noticeably blurrier/blockier
  // than "high" does for the same source resolution.
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return [canvas, ctx];
}

/** A cover-fit draw: fills the box and crops the overflow, like CSS object-fit: cover. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const scale = Math.max(w / image.width, h / image.height);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, x, y, w, h);
}

/** A diagonal two-color fill approximating the live preview's `linear-gradient(135deg, ...)`. */
function diagonalGradient(
  ctx: CanvasRenderingContext2D,
  colors: [string, string],
  x: number,
  y: number,
  w: number,
  h: number,
): CanvasGradient {
  const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);
  return gradient;
}

/** A sticker-style print: hard shadow, a colored (flat, gradient or patterned) frame, outlined
 * border. The shadow stays ink regardless of the frame's own colors, matching every sticker in
 * the app. */
function drawFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  bg: string | CanvasGradient = "#ffffff",
  border = INK,
  patternOverlay?: CanvasPattern,
) {
  ctx.fillStyle = INK;
  ctx.fillRect(x + 12, y + 12, w, h);
  ctx.fillStyle = bg;
  ctx.fillRect(x, y, w, h);
  // The pattern tile has a transparent background and only an opaque foreground shape (see
  // src/lib/framePatterns.ts), so layering it on top of the gradient/flat fill above lets a frame
  // be both patterned and a gradient at once, matching the live preview's layered CSS backgrounds.
  if (patternOverlay) {
    ctx.fillStyle = patternOverlay;
    ctx.fillRect(x, y, w, h);
  }
  ctx.lineWidth = 6;
  ctx.strokeStyle = border;
  ctx.strokeRect(x, y, w, h);
}

/** Loads a frame's tiled pattern (see src/lib/framePatterns.ts) as a repeating CanvasPattern, or
 * null for a frame with no pattern. */
async function patternFor(frame: FramePreset): Promise<CanvasPattern | null> {
  if (!frame.pattern) return null;
  const image = await loadImage(
    patternDataUri(frame.pattern, frame.patternColor ?? frame.borderColor),
  );
  return document.createElement("canvas").getContext("2d")?.createPattern(image, "repeat") ?? null;
}

/** A hand-drawn squiggle doodle near the bottom of the photo — matches the live preview's SVG
 * wave path, scaled to the photo's own width/height. */
function drawSwirl(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const vbW = 200;
  const vbH = 40;
  const scale = (w * 0.7) / vbW;
  const originX = x + w * 0.15;
  const originY = y + h * 0.94 - vbH * scale;
  const p = (vx: number, vy: number): [number, number] => [
    originX + vx * scale,
    originY + vy * scale,
  ];
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 7 * scale;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(...p(5, 20));
  ctx.quadraticCurveTo(...p(30, 2), ...p(55, 20));
  ctx.quadraticCurveTo(...p(80, 38), ...p(105, 20));
  ctx.quadraticCurveTo(...p(130, 2), ...p(155, 20));
  ctx.quadraticCurveTo(...p(180, 38), ...p(195, 20));
  ctx.stroke();
  ctx.restore();
}

/** Draws each placed sticker over the photo at its relative position/size — matches the live
 * preview's StickerLayer geometry (coordinates and size are both fractions of the photo itself).
 * `icons` must be pre-loaded, one per entry in `stickers`, in the same order — `null` for a
 * "banner" sticker, which has no fixed icon image and is drawn directly with its own text instead. */
function drawStickerIcons(
  ctx: CanvasRenderingContext2D,
  stickers: PlacedSticker[],
  icons: (HTMLImageElement | null)[],
  x: number,
  y: number,
  w: number,
  h: number,
) {
  stickers.forEach((sticker, i) => {
    const dw = sticker.size * w;
    const dh = dw / (sticker.aspect ?? 1);
    const cx = x + sticker.x * w;
    const cy = y + sticker.y * h;
    if (sticker.iconId === "banner") {
      drawBannerOnCanvas(ctx, sticker.text ?? "", cx, cy, dw, dh);
      return;
    }
    const icon = icons[i];
    if (!icon) return;
    ctx.drawImage(icon, cx - dw / 2, cy - dh / 2, dw, dh);
  });
}

/** `tornBorderColor`, when set, clips the photo to the same ragged outline the live preview uses
 * (see src/lib/tornEdge.ts) and strokes that outline instead of a plain rectangle. */
function drawPhoto(
  ctx: CanvasRenderingContext2D,
  picture: Picture,
  x: number,
  y: number,
  w: number,
  h: number,
  filterCss = "none",
  tornBorderColor?: string,
) {
  if (tornBorderColor) {
    ctx.save();
    traceTornEdge(ctx, x, y, w, h);
    ctx.clip();
    ctx.filter = filterCss;
    drawCover(ctx, picture.image, x, y, w, h);
    ctx.restore();
    ctx.lineWidth = 4;
    ctx.strokeStyle = tornBorderColor;
    traceTornEdge(ctx, x, y, w, h);
    ctx.stroke();
    return;
  }
  ctx.save();
  ctx.filter = filterCss;
  drawCover(ctx, picture.image, x, y, w, h);
  ctx.restore();
  ctx.lineWidth = 4;
  ctx.strokeStyle = INK;
  ctx.strokeRect(x, y, w, h);
}

/** Renders one polaroid, with its caption and score line, as a PNG. `filterCss` is baked into
 * the photo only (frame, caption and postmark stay untouched), matching the live preview. */
export async function renderPolaroidBlob(memory: Memory, filterCss = "none"): Promise<Blob> {
  const [picture] = await Promise.all([pictureOf(memory), ensureFonts()]);
  const art = getArt(memory.artId);

  const margin = 64;
  const pad = 44;
  const cardW = 880;
  const photoW = cardW - pad * 2;
  const photoH = Math.round(photoW / picture.aspect);
  const footer = 230;
  const cardH = pad + photoH + footer;
  const [canvas, ctx] = makeCanvas(cardW + margin * 2 + 12, cardH + margin * 2 + 12);

  ctx.fillStyle = IVORY;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawFrame(ctx, margin, margin, cardW, cardH);
  drawPhoto(ctx, picture, margin + pad, margin + pad, photoW, photoH, filterCss);

  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const cx = margin + cardW / 2;
  const captionY = margin + pad + photoH + 96;
  ctx.font = '700 84px "Caveat", cursive';
  ctx.fillText(memory.caption ?? art.caption, cx, captionY);

  const accuracy = memory.accuracy !== undefined ? ` · ${formatAccuracy(memory.accuracy)}` : "";
  ctx.font = '600 34px "Bricolage Grotesque", system-ui, sans-serif';
  ctx.fillStyle = "#4a4f6e";
  ctx.fillText(
    `${memory.score} pts · ${memory.moves} moves · ${formatTime(memory.seconds)}${accuracy}`,
    cx,
    captionY + 62,
  );

  ctx.textAlign = "right";
  ctx.font = '800 30px "Unbounded", system-ui, sans-serif';
  ctx.fillStyle = INK;
  ctx.fillText("PinchPop", margin + cardW - pad, margin + cardH - 34);
  return toBlob(canvas);
}

export interface QuickPolaroid {
  photo: string;
  /** Width divided by height. */
  aspect: number;
  /** Empty leaves the print with no caption at all — there is no implicit placeholder text. */
  caption: string;
  /** Already formatted (e.g. "Oct 3"); omit to leave the date off the print entirely. */
  timestamp?: string;
  stickers?: PlacedSticker[];
  /** A CSS font-family value, e.g. '"Dancing Script", cursive' — see src/lib/captionFonts.ts. */
  captionFontFamily?: string;
  /** Caption size in the live preview's own px scale (default 26) — scaled up for this canvas. */
  captionSize?: number;
  /** Overrides the frame's own caption color when set. */
  captionColor?: string;
  /** "tape" sits the caption on a rotated colored strip, like a hand-placed label. */
  captionBackground?: "plain" | "tape";
  captionBgColor?: string;
}

/** Renders a polaroid from any photo — no score/moves line, since there is no puzzle behind it —
 * for the no-game "make a polaroid" tool. `frame` (see src/lib/frames.ts) controls the frame's
 * own color/gradient, border, and default caption color. */
export async function renderQuickPolaroidBlob(
  input: QuickPolaroid,
  filterCss: string,
  frame: FramePreset,
): Promise<Blob> {
  const stickers = input.stickers ?? [];
  const [picture, stickerIcons, pattern] = await Promise.all([
    loadImage(input.photo).then((image) => ({
      image,
      aspect: Math.min(1.4, Math.max(0.75, input.aspect)),
    })),
    Promise.all(
      stickers.map((s) => (s.iconId === "banner" ? null : loadImage(stickerIconDataUri(s.iconId)))),
    ),
    patternFor(frame),
    ensureFonts(),
  ]);

  const margin = 64;
  const pad = 44;
  const cardW = 880;
  const photoW = cardW - pad * 2;
  const photoH = Math.round(photoW / picture.aspect);
  const footer = input.timestamp ? 230 : 170;
  const cardH = pad + photoH + footer;
  const [canvas, ctx] = makeCanvas(cardW + margin * 2 + 12, cardH + margin * 2 + 12);

  ctx.fillStyle = IVORY;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const bg = frame.gradient
    ? diagonalGradient(ctx, frame.gradient, margin, margin, cardW, cardH)
    : frame.frameBg;
  drawFrame(ctx, margin, margin, cardW, cardH, bg, frame.borderColor, pattern ?? undefined);
  drawPhoto(
    ctx,
    picture,
    margin + pad,
    margin + pad,
    photoW,
    photoH,
    filterCss,
    frame.tornEdge ? frame.borderColor : undefined,
  );
  if (stickers.length > 0) {
    drawStickerIcons(ctx, stickers, stickerIcons, margin + pad, margin + pad, photoW, photoH);
  }
  if (frame.swirlColor) {
    drawSwirl(ctx, frame.swirlColor, margin + pad, margin + pad, photoW, photoH);
  }

  const cx = margin + cardW / 2;
  const captionY = margin + pad + photoH + 96;
  const captionColor = input.captionColor ?? frame.captionColor;
  const hasCaption = input.caption.length > 0;

  if (hasCaption) {
    const size = Math.round((input.captionSize ?? 26) * CAPTION_SCALE);
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = `700 ${size}px ${input.captionFontFamily ?? '"Caveat", cursive'}`;

    if (input.captionBackground === "tape") {
      const textWidth = ctx.measureText(input.caption).width;
      const padX = size * 0.35;
      const padY = size * 0.22;
      const rectW = textWidth + padX * 2;
      const rectH = size * 0.78 + padY * 2;
      const color = input.captionBgColor ?? "#ffc61a";
      drawTapeStrip(
        ctx,
        cx,
        captionY - size * 0.3,
        rectW,
        rectH,
        lighten(color, 0.15),
        color,
        -0.025,
      );
    }

    ctx.fillStyle = captionColor;
    ctx.fillText(input.caption, cx, captionY);
  }

  if (input.timestamp) {
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = '600 34px "Bricolage Grotesque", system-ui, sans-serif';
    ctx.fillStyle = captionColor;
    ctx.fillText(input.timestamp, cx, hasCaption ? captionY + 62 : captionY);
  }

  ctx.textAlign = "right";
  ctx.font = '700 40px "Dancing Script", cursive';
  ctx.fillStyle = captionColor;
  ctx.fillText("PinchPop", margin + cardW - pad, margin + cardH - 30);
  return toBlob(canvas);
}

/** Renders up to three camera photos as a vertical photobooth strip, oldest at the top. */
export async function renderStripBlob(memories: Memory[]): Promise<Blob> {
  // Newest three camera photos, laid out oldest first like a real photobooth strip.
  const shots = memories
    .filter((m) => m.photo)
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(-3);
  if (shots.length === 0) throw new Error("Take a camera photo first to build a strip.");
  const [pictures] = await Promise.all([Promise.all(shots.map(pictureOf)), ensureFonts()]);

  const margin = 56;
  const pad = 30;
  const gap = 26;
  const photoW = 520;
  const heights = pictures.map((p) => Math.round(photoW / p.aspect));
  const stripW = photoW + pad * 2;
  const stripH = pad + heights.reduce((sum, h) => sum + h + gap, 0) + 120;
  const [canvas, ctx] = makeCanvas(stripW + margin * 2 + 12, stripH + margin * 2 + 12);

  ctx.fillStyle = IVORY;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawFrame(ctx, margin, margin, stripW, stripH);

  let y = margin + pad;
  pictures.forEach((picture, i) => {
    drawPhoto(ctx, picture, margin + pad, y, photoW, heights[i]);
    y += heights[i] + gap;
  });

  ctx.fillStyle = MARIGOLD;
  ctx.fillRect(margin + pad, y - 6, photoW, 4);
  ctx.textAlign = "center";
  ctx.fillStyle = INK;
  ctx.font = '800 34px "Unbounded", system-ui, sans-serif';
  ctx.fillText("PinchPop", margin + stripW / 2, y + 44);
  ctx.font = '700 40px "Caveat", cursive';
  ctx.fillText(formatDate(shots[shots.length - 1].createdAt), margin + stripW / 2, y + 88);
  return toBlob(canvas);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export type ShareOutcome = "shared" | "downloaded" | "cancelled";

/** Opens the system share sheet with the image when the browser supports it; otherwise downloads it. */
export async function shareOrDownload(
  blob: Blob,
  filename: string,
  title: string,
): Promise<ShareOutcome> {
  const file = new File([blob], filename, { type: blob.type });
  if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
      // Any other failure falls through to a plain download.
    }
  }
  downloadBlob(blob, filename);
  return "downloaded";
}
