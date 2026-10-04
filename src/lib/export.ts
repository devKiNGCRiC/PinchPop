import { createElement } from "react";

import { Art } from "@/components/Art";
import butterflyUrl from "@/assets/stickers/butterfly-tan.svg";
import hibiscusUrl from "@/assets/stickers/hibiscus-muted.svg";
import satinBowPinkUrl from "@/assets/stickers/satin-bow-pink.svg";
import silverStarUrl from "@/assets/stickers/silver-star.svg";
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
const CORAL = "#ff6b5b";
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
    // A soft shadow under every sticker so it reads as placed on the photo rather than flat —
    // matches the live preview's CSS drop-shadow (see StickerLayer.tsx).
    ctx.save();
    ctx.shadowColor = "rgba(17,20,38,0.35)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 4;
    if (sticker.iconId === "banner") {
      drawBannerOnCanvas(ctx, sticker.text ?? "", cx, cy, dw, dh);
    } else {
      const icon = icons[i];
      if (icon) ctx.drawImage(icon, cx - dw / 2, cy - dh / 2, dw, dh);
    }
    ctx.restore();
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

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface QuickRender {
  canvas: HTMLCanvasElement;
  /** The photo's own rectangle on the canvas — sticker positions are fractions of this. */
  photo: Rect;
}

const MARGIN = 64;
const CARD_W = 880;
const FILM_BAND = 96;
const CASSETTE_BAND = 170;
const NOTE_PAPER = "#fdf8ec";
const CASSETTE_SHELL = "#f6ecd6";
const STICKY = "#ffe27a";
const STICKY_CURL = "#f2c94c";

interface QuickLayout {
  canvasW: number;
  canvasH: number;
  card: Rect;
  photo: Rect;
  captionY: number;
  tsY: number;
}

function quickLayout(
  frame: FramePreset,
  aspect: number,
  hasCaption: boolean,
  hasTs: boolean,
): QuickLayout {
  const x = MARGIN;
  const y = MARGIN;
  const captionGap = hasCaption ? 62 : 0;
  let card: Rect;
  let photo: Rect;
  let captionY: number;
  let tsY: number;

  if (frame.design === "film") {
    const photoW = 760;
    const photoH = Math.round(photoW / aspect);
    photo = { x: x + 60, y: y + FILM_BAND + 44, w: photoW, h: photoH };
    captionY = photo.y + photoH + 100;
    tsY = captionY + captionGap;
    card = {
      x,
      y,
      w: CARD_W,
      h: FILM_BAND + 44 + photoH + (hasTs ? 190 : 140) + FILM_BAND,
    };
  } else if (frame.design === "notebook") {
    const photoW = 760;
    const photoH = Math.round(photoW / aspect);
    photo = { x: x + 60, y: y + 84, w: photoW, h: photoH };
    captionY = photo.y + photoH + 110;
    tsY = captionY + captionGap;
    card = { x, y, w: CARD_W, h: 84 + photoH + (hasTs ? 200 : 150) + 50 };
  } else if (frame.design === "cassette") {
    const photoW = 560;
    const photoH = Math.round(photoW / aspect);
    photo = { x: x + (CARD_W - photoW) / 2, y: y + CASSETTE_BAND + 56, w: photoW, h: photoH };
    captionY = y + CASSETTE_BAND / 2 + 22;
    tsY = photo.y + photoH + 44;
    card = { x, y, w: CARD_W, h: CASSETTE_BAND + 56 + photoH + 170 };
  } else if (frame.design === "sticky") {
    const photoW = 700;
    const photoH = Math.round(photoW / aspect);
    photo = { x: x + 90, y: y + 90, w: photoW, h: photoH };
    captionY = photo.y + photoH + 118;
    tsY = captionY + captionGap;
    card = { x, y, w: CARD_W, h: 90 + photoH + (hasTs ? 200 : 150) + 40 };
  } else if (frame.design === "lace") {
    const inset = 24;
    const pad = 40;
    const photoW = CARD_W - inset * 2 - pad * 2;
    const photoH = Math.round(photoW / aspect);
    const cardX = x + inset;
    const cardY = y + inset;
    photo = { x: cardX + pad, y: cardY + pad, w: photoW, h: photoH };
    captionY = photo.y + photoH + 96;
    tsY = captionY + captionGap;
    card = { x: cardX, y: cardY, w: CARD_W - inset * 2, h: pad + photoH + (hasTs ? 230 : 170) };
  } else if (frame.design === "note") {
    const inset = 40;
    const cardX = x + inset;
    const cardY = y + inset;
    const photoW = CARD_W - inset * 2 - 120;
    const photoH = Math.round(photoW / aspect);
    photo = { x: cardX + 60, y: cardY + 70, w: photoW, h: photoH };
    captionY = photo.y + photoH + 110;
    tsY = captionY + captionGap;
    card = { x: cardX, y: cardY, w: CARD_W - inset * 2, h: 70 + photoH + (hasTs ? 210 : 160) };
  } else if (frame.design === "ribbon") {
    const photoW = 792;
    const photoH = Math.round(photoW / aspect);
    photo = { x: x + 44, y: y + 44, w: photoW, h: photoH };
    captionY = photo.y + photoH + 64;
    tsY = captionY + captionGap;
    card = { x, y, w: CARD_W, h: 44 + photoH + (hasTs ? 260 : 200) };
  } else {
    const pad = 44;
    const photoW = CARD_W - pad * 2;
    const photoH = Math.round(photoW / aspect);
    photo = { x: x + pad, y: y + pad, w: photoW, h: photoH };
    captionY = photo.y + photoH + 96;
    tsY = captionY + captionGap;
    card = { x, y, w: CARD_W, h: pad + photoH + (hasTs ? 230 : 170) };
  }

  return {
    canvasW: card.w + MARGIN * 2 + 12,
    canvasH: card.h + MARGIN * 2 + 12,
    card,
    photo,
    captionY,
    tsY,
  };
}

interface DecorImages {
  butterfly: HTMLImageElement;
  hibiscus: HTMLImageElement;
  bow: HTMLImageElement;
  star: HTMLImageElement;
}

interface DrawArgs {
  ctx: CanvasRenderingContext2D;
  input: QuickPolaroid;
  frame: FramePreset;
  picture: Picture;
  filterCss: string;
  pattern: CanvasPattern | null;
  decor: DecorImages | null;
  L: QuickLayout;
}

async function loadDecor(): Promise<DecorImages> {
  const [butterfly, hibiscus, bow, star] = await Promise.all([
    loadImage(butterflyUrl),
    loadImage(hibiscusUrl),
    loadImage(satinBowPinkUrl),
    loadImage(silverStarUrl),
  ]);
  return { butterfly, hibiscus, bow, star };
}

const BOW_ASPECT = 1052.4 / 744.09;
const STAR_ASPECT = 86.046 / 81.715;
const HIBISCUS_ASPECT = 519.48 / 363.65;
const BUTTERFLY_ASPECT = 697.91 / 535.04;

function drawImageCentered(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  cx: number,
  cy: number,
  w: number,
  aspect: number,
): void {
  const h = w / aspect;
  ctx.drawImage(image, cx - w / 2, cy - h / 2, w, h);
}

/** A soft, slightly lifted kiss print — two lip shapes and a centre line, drawn rather than sourced
 * because the available clip art was too saturated to read as a lipstick print. */
function drawKissMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.12);
  ctx.scale(scale, scale);
  const fill = ctx.createLinearGradient(-60, 0, 60, 0);
  fill.addColorStop(0, "#f1bfcb");
  fill.addColorStop(0.5, "#f9dfe6");
  fill.addColorStop(1, "#f1bfcb");
  ctx.fillStyle = fill;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(-58, 0);
  ctx.bezierCurveTo(-40, -26, -16, -30, 0, -16);
  ctx.bezierCurveTo(16, -30, 40, -26, 58, 0);
  ctx.bezierCurveTo(30, 6, -30, 6, -58, 0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-58, 0);
  ctx.bezierCurveTo(-30, 6, 30, 6, 58, 0);
  ctx.bezierCurveTo(48, 26, 24, 34, 0, 30);
  ctx.bezierCurveTo(-24, 34, -48, 26, -58, 0);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "#c98fa0";
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(-54, 0);
  ctx.quadraticCurveTo(0, 10, 54, 0);
  ctx.stroke();
  ctx.restore();
}

function drawSoftPhoto(ctx: CanvasRenderingContext2D, a: DrawArgs, p: Rect): void {
  ctx.save();
  ctx.filter = a.filterCss;
  drawCover(ctx, a.picture.image, p.x, p.y, p.w, p.h);
  ctx.restore();
  ctx.strokeStyle = "#d9d0d8";
  ctx.lineWidth = 2;
  ctx.strokeRect(p.x, p.y, p.w, p.h);
}

function drawLace(a: DrawArgs): void {
  const { ctx, L, frame } = a;
  const { card, photo } = L;
  const { width, height } = ctx.canvas;
  ctx.fillStyle = frame.frameBg;
  ctx.fillRect(0, 0, width, height);
  if (a.pattern) {
    ctx.fillStyle = a.pattern;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.save();
  ctx.shadowColor = "rgba(122,42,70,0.28)";
  ctx.shadowBlur = 36;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "#fffdfb";
  ctx.fillRect(card.x, card.y, card.w, card.h);
  ctx.restore();
  drawSoftPhoto(ctx, a, photo);
  const captionColor = a.input.captionColor ?? frame.captionColor;
  drawCaptionAndDate(a, captionColor);
  drawBrand(ctx, card.x + 44, card.y + card.h - 30, captionColor, "left");
  drawKissMark(ctx, card.x + card.w - 130, card.y + card.h - 80, 1.2);
}

const NOTE_CREAM = "#faf4ea";

function drawNote(a: DrawArgs): void {
  const { ctx, L, frame } = a;
  const { card, photo } = L;
  ctx.save();
  ctx.shadowColor = "rgba(40,30,30,0.18)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = NOTE_CREAM;
  ctx.fillRect(card.x, card.y, card.w, card.h);
  ctx.restore();
  ctx.fillStyle = IVORY;
  for (let nx = card.x + 11; nx < card.x + card.w; nx += 22) {
    ctx.beginPath();
    ctx.arc(nx, card.y, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  drawSoftPhoto(ctx, a, photo);

  const hx = card.x + card.w - 120;
  const hy = card.y + card.h - 80;
  ctx.strokeStyle = "#f0909f";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(hx, hy + 14);
  ctx.bezierCurveTo(hx - 28, hy - 10, hx - 26, hy - 34, hx, hy - 20);
  ctx.bezierCurveTo(hx + 26, hy - 34, hx + 28, hy - 10, hx, hy + 14);
  ctx.stroke();
  ctx.fillStyle = "#f0909f";
  for (const [dx, dy] of [
    [18, -40],
    [30, -30],
  ]) {
    ctx.beginPath();
    ctx.arc(hx + dx, hy + dy, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.globalAlpha = 0.85;
  drawTapeStrip(ctx, card.x + 70, card.y + 6, 200, 56, "#f7c3cf", "#eda9b8", -0.6);
  ctx.restore();

  drawCaptionAndDate(a, a.input.captionColor ?? frame.captionColor);
}

/** A small pressed-flower sprig: a curved stem with five-petal blooms in dried cream and gold. */
function drawDriedSprig(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.save();
  ctx.strokeStyle = "#b8a27a";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x - 30, y - 110, x + 30, y - 210);
  ctx.stroke();
  const blooms: [number, number][] = [
    [x + 4, y - 60],
    [x - 18, y - 110],
    [x + 12, y - 150],
    [x + 26, y - 200],
    [x - 8, y - 30],
  ];
  for (const [bx, by] of blooms) {
    for (let p = 0; p < 5; p++) {
      const angle = (p * Math.PI * 2) / 5;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.ellipse(0, -7, 5, 7, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#f4e6b3";
      ctx.fill();
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = "#b8a27a";
      ctx.stroke();
      ctx.restore();
    }
    ctx.beginPath();
    ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#d9b86a";
    ctx.fill();
  }
  ctx.restore();
}

function drawDried(a: DrawArgs): void {
  const { ctx, L, frame, decor } = a;
  const { card, photo } = L;
  ctx.save();
  ctx.shadowColor = "rgba(60,50,40,0.18)";
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = frame.frameBg;
  ctx.fillRect(card.x, card.y, card.w, card.h);
  ctx.restore();
  drawSoftPhoto(ctx, a, photo);

  drawDriedSprig(ctx, card.x + 70, card.y + card.h - 40);
  drawTapeStrip(ctx, card.x + 150, card.y + card.h - 92, 150, 46, "#d9b98c", "#c49e6f", -0.35);
  if (decor) {
    drawImageCentered(
      ctx,
      decor.butterfly,
      card.x + card.w - 80,
      card.y + 40,
      190,
      BUTTERFLY_ASPECT,
    );
  }

  drawCaptionAndDate(a, a.input.captionColor ?? frame.captionColor);
  drawBrand(ctx, card.x + card.w - 44, card.y + card.h - 30, frame.captionColor, "right");
}

function drawRibbon(a: DrawArgs): void {
  const { ctx, L, frame } = a;
  const { card, photo } = L;
  const decor = a.decor;
  ctx.save();
  ctx.shadowColor = "rgba(60,30,50,0.22)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(card.x, card.y, card.w, card.h);
  ctx.restore();
  drawSoftPhoto(ctx, a, photo);

  const bandCenter = card.y + card.h - 72;
  const half = 28;
  const steps = 60;
  const wave = (x: number) => Math.sin(((x - card.x) / card.w) * Math.PI * 3) * 6;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const x = card.x + (card.w * i) / steps;
    const y = bandCenter - half + wave(x);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let i = steps; i >= 0; i--) {
    const x = card.x + (card.w * i) / steps;
    ctx.lineTo(x, bandCenter + half + wave(x));
  }
  ctx.closePath();
  const band = ctx.createLinearGradient(card.x, 0, card.x + card.w, 0);
  band.addColorStop(0, "#f2a2bb");
  band.addColorStop(0.5, "#ffd3df");
  band.addColorStop(1, "#f2a2bb");
  ctx.fillStyle = band;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.5)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const x = card.x + (card.w * i) / steps;
    const y = bandCenter - half * 0.45 + wave(x);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  if (decor) {
    drawImageCentered(ctx, decor.star, card.x + 92, bandCenter - 10, 92, STAR_ASPECT);
    drawImageCentered(ctx, decor.star, card.x + 160, bandCenter - 40, 62, STAR_ASPECT);
    drawImageCentered(ctx, decor.bow, card.x + card.w - 120, bandCenter + 30, 220, BOW_ASPECT);
    drawImageCentered(ctx, decor.hibiscus, card.x + 70, card.y + 70, 200, HIBISCUS_ASPECT);
  }

  ctx.save();
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.font = '700 44px "Dancing Script", cursive';
  ctx.fillStyle = "#8a1f44";
  ctx.fillText("with love", card.x + card.w - 60, bandCenter - half - 40);
  ctx.restore();

  drawCaptionAndDate(a, a.input.captionColor ?? frame.captionColor);
}

function drawCaption(
  ctx: CanvasRenderingContext2D,
  input: QuickPolaroid,
  cx: number,
  y: number,
  color: string,
): void {
  if (input.caption.length === 0) return;
  const size = Math.round((input.captionSize ?? 26) * CAPTION_SCALE);
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = `700 ${size}px ${input.captionFontFamily ?? '"Caveat", cursive'}`;
  if (input.captionBackground === "tape") {
    const textWidth = ctx.measureText(input.caption).width;
    const padX = size * 0.35;
    const padY = size * 0.22;
    const rectW = textWidth + padX * 2;
    const rectH = size * 0.78 + padY * 2;
    const tape = input.captionBgColor ?? "#ffc61a";
    drawTapeStrip(ctx, cx, y - size * 0.3, rectW, rectH, lighten(tape, 0.15), tape, -0.025);
  }
  ctx.fillStyle = color;
  ctx.fillText(input.caption, cx, y);
  ctx.restore();
}

function drawCaptionAndDate(a: DrawArgs, color: string): void {
  const cx = a.L.card.x + a.L.card.w / 2;
  drawCaption(a.ctx, a.input, cx, a.L.captionY, color);
  if (!a.input.timestamp) return;
  a.ctx.save();
  a.ctx.textAlign = "center";
  a.ctx.textBaseline = "alphabetic";
  a.ctx.font = '600 34px "Bricolage Grotesque", system-ui, sans-serif';
  a.ctx.fillStyle = color;
  a.ctx.fillText(a.input.timestamp, cx, a.L.tsY);
  a.ctx.restore();
}

function drawBrand(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  align: CanvasTextAlign,
): void {
  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.font = '700 40px "Dancing Script", cursive';
  ctx.fillStyle = color;
  ctx.fillText("PinchPop", x, y);
  ctx.restore();
}

function drawClassic(a: DrawArgs): void {
  const { ctx, frame, L } = a;
  const bg = frame.gradient
    ? diagonalGradient(ctx, frame.gradient, L.card.x, L.card.y, L.card.w, L.card.h)
    : frame.frameBg;
  drawFrame(
    ctx,
    L.card.x,
    L.card.y,
    L.card.w,
    L.card.h,
    bg,
    frame.borderColor,
    a.pattern ?? undefined,
  );
  drawPhoto(
    ctx,
    a.picture,
    L.photo.x,
    L.photo.y,
    L.photo.w,
    L.photo.h,
    a.filterCss,
    frame.tornEdge ? frame.borderColor : undefined,
  );
}

function drawFilm(a: DrawArgs): void {
  const { ctx, L, frame } = a;
  const { card, photo } = L;
  drawFrame(ctx, card.x, card.y, card.w, card.h, INK, INK);
  ctx.fillStyle = IVORY;
  for (const cy of [card.y + 20, card.y + card.h - 20]) {
    for (let hx = card.x + 34; hx < card.x + card.w - 34; hx += 56) {
      ctx.fillRect(hx, cy - 10, 28, 20);
    }
  }
  drawPhoto(ctx, a.picture, photo.x, photo.y, photo.w, photo.h, a.filterCss);
  ctx.strokeStyle = IVORY;
  ctx.lineWidth = 3;
  ctx.strokeRect(photo.x - 4, photo.y - 4, photo.w + 8, photo.h + 8);
  drawCaptionAndDate(a, a.input.captionColor ?? frame.captionColor);
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = '700 30px "Bricolage Grotesque", system-ui, sans-serif';
  ctx.fillStyle = MARIGOLD;
  ctx.fillText("12A", card.x + 60, card.y + card.h - 40);
  ctx.restore();
  drawBrand(ctx, card.x + card.w - 60, card.y + card.h - 40, IVORY, "right");
}

function drawNotebook(a: DrawArgs): void {
  const { ctx, L } = a;
  const { card, photo } = L;
  drawFrame(ctx, card.x, card.y, card.w, card.h, NOTE_PAPER, INK);
  ctx.save();
  ctx.beginPath();
  ctx.rect(card.x, card.y, card.w, card.h);
  ctx.clip();
  ctx.strokeStyle = "#cfe0f5";
  ctx.lineWidth = 2;
  for (let y = card.y + 120; y < card.y + card.h; y += 44) {
    ctx.beginPath();
    ctx.moveTo(card.x, y);
    ctx.lineTo(card.x + card.w, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "#f29b9b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(card.x + 48, card.y);
  ctx.lineTo(card.x + 48, card.y + card.h);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "rgba(17,20,38,0.18)";
  ctx.fillRect(photo.x + 8, photo.y + 10, photo.w, photo.h);
  drawPhoto(ctx, a.picture, photo.x, photo.y, photo.w, photo.h, a.filterCss);
  drawTapeStrip(ctx, photo.x + 40, photo.y + 6, 150, 46, lighten(MARIGOLD, 0.15), MARIGOLD, -0.6);
  drawTapeStrip(
    ctx,
    photo.x + photo.w - 40,
    photo.y + 6,
    150,
    46,
    lighten(CORAL, 0.15),
    CORAL,
    0.55,
  );
  drawCaptionAndDate(a, a.input.captionColor ?? a.frame.captionColor);
  drawBrand(ctx, card.x + card.w - 44, card.y + card.h - 30, INK, "right");
}

function drawCassette(a: DrawArgs): void {
  const { ctx, L } = a;
  const { card, photo } = L;
  drawFrame(ctx, card.x, card.y, card.w, card.h, CASSETTE_SHELL, INK);
  ctx.fillStyle = CORAL;
  ctx.fillRect(card.x, card.y, card.w, CASSETTE_BAND);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(card.x, card.y + CASSETTE_BAND);
  ctx.lineTo(card.x + card.w, card.y + CASSETTE_BAND);
  ctx.stroke();
  drawPhoto(ctx, a.picture, photo.x, photo.y, photo.w, photo.h, a.filterCss);
  const holeY = card.y + card.h - 70;
  for (const hx of [card.x + card.w / 2 - 120, card.x + card.w / 2 + 120]) {
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.arc(hx, holeY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = CASSETTE_SHELL;
    ctx.beginPath();
    ctx.arc(hx, holeY, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  drawCaptionAndDate(a, INK);
  drawBrand(ctx, card.x + card.w - 44, card.y + card.h - 40, INK, "right");
}

function drawSticky(a: DrawArgs): void {
  const { ctx, L } = a;
  const { card, photo } = L;
  drawFrame(ctx, card.x, card.y, card.w, card.h, STICKY, INK);
  ctx.beginPath();
  ctx.moveTo(card.x + card.w, card.y + card.h - 96);
  ctx.lineTo(card.x + card.w - 96, card.y + card.h);
  ctx.lineTo(card.x + card.w, card.y + card.h);
  ctx.closePath();
  ctx.fillStyle = STICKY_CURL;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.fillStyle = "rgba(17,20,38,0.2)";
  ctx.fillRect(photo.x - 14, photo.y - 10, photo.w + 36, photo.h + 36);
  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(photo.x - 18, photo.y - 18, photo.w + 36, photo.h + 36);
  drawPhoto(ctx, a.picture, photo.x, photo.y, photo.w, photo.h, a.filterCss);
  const pinX = card.x + card.w / 2;
  const pinY = photo.y - 14;
  ctx.fillStyle = "rgba(17,20,38,0.25)";
  ctx.beginPath();
  ctx.arc(pinX + 4, pinY + 7, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = CORAL;
  ctx.beginPath();
  ctx.arc(pinX, pinY, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = INK;
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.arc(pinX - 7, pinY - 7, 6, 0, Math.PI * 2);
  ctx.fill();
  drawCaptionAndDate(a, INK);
  drawBrand(ctx, card.x + 44, card.y + card.h - 30, INK, "left");
}

/** Renders a polaroid from any photo — no score/moves line, since there is no puzzle behind it —
 * for the no-game "make a polaroid" tool. `frame` picks the card design (or the classic frame when
 * it has none) and its colors. Stickers are skipped when `includeStickers` is false, for the live
 * preview, which draws them as an editable overlay instead. */
export async function renderQuickPolaroidCanvas(
  input: QuickPolaroid,
  filterCss: string,
  frame: FramePreset,
  includeStickers = true,
): Promise<QuickRender> {
  const stickers = input.stickers ?? [];
  const [picture, stickerIcons, pattern, decor] = await Promise.all([
    loadImage(input.photo).then((image) => ({
      image,
      aspect: Math.min(1.4, Math.max(0.75, input.aspect)),
    })),
    Promise.all(
      stickers.map((s) => (s.iconId === "banner" ? null : loadImage(stickerIconDataUri(s.iconId)))),
    ),
    patternFor(frame),
    frame.design === "ribbon" || frame.design === "dried" ? loadDecor() : Promise.resolve(null),
    ensureFonts(),
  ]);

  const L = quickLayout(frame, picture.aspect, input.caption.length > 0, Boolean(input.timestamp));
  const [canvas, ctx] = makeCanvas(L.canvasW, L.canvasH);
  ctx.fillStyle = IVORY;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const args: DrawArgs = { ctx, input, frame, picture, filterCss, pattern, decor, L };
  if (frame.design === "film") drawFilm(args);
  else if (frame.design === "notebook") drawNotebook(args);
  else if (frame.design === "cassette") drawCassette(args);
  else if (frame.design === "sticky") drawSticky(args);
  else if (frame.design === "lace") drawLace(args);
  else if (frame.design === "ribbon") drawRibbon(args);
  else if (frame.design === "note") drawNote(args);
  else if (frame.design === "dried") drawDried(args);
  else drawClassic(args);

  if (includeStickers && stickers.length > 0) {
    drawStickerIcons(ctx, stickers, stickerIcons, L.photo.x, L.photo.y, L.photo.w, L.photo.h);
  }

  if (!frame.design) {
    if (frame.swirlColor) {
      drawSwirl(ctx, frame.swirlColor, L.photo.x, L.photo.y, L.photo.w, L.photo.h);
    }
    const captionColor = input.captionColor ?? frame.captionColor;
    drawCaptionAndDate(args, captionColor);
    drawBrand(ctx, L.card.x + L.card.w - 44, L.card.y + L.card.h - 30, captionColor, "right");
  }

  return { canvas, photo: L.photo };
}

export async function renderQuickPolaroidBlob(
  input: QuickPolaroid,
  filterCss: string,
  frame: FramePreset,
): Promise<Blob> {
  const { canvas } = await renderQuickPolaroidCanvas(input, filterCss, frame);
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
