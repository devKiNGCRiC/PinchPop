import { createElement } from "react";

import { Art } from "@/components/Art";
import { getArt } from "@/lib/art";
import type { Memory } from "@/lib/memories";
import { formatAccuracy, formatTime } from "@/lib/puzzle";
import { formatDate } from "@/lib/stats";

const INK = "#111426";
const IVORY = "#fff6e6";
const MARIGOLD = "#ffc61a";

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

/** A sticker-style print: hard shadow, white frame, ink outlines. */
function drawFrame(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = INK;
  ctx.fillRect(x + 12, y + 12, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x, y, w, h);
  ctx.lineWidth = 6;
  ctx.strokeStyle = INK;
  ctx.strokeRect(x, y, w, h);
}

function drawPhoto(
  ctx: CanvasRenderingContext2D,
  picture: Picture,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  drawCover(ctx, picture.image, x, y, w, h);
  ctx.lineWidth = 4;
  ctx.strokeStyle = INK;
  ctx.strokeRect(x, y, w, h);
}

/** Renders one polaroid, with its caption and score line, as a PNG. */
export async function renderPolaroidBlob(memory: Memory): Promise<Blob> {
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
  drawPhoto(ctx, picture, margin + pad, margin + pad, photoW, photoH);

  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const cx = margin + cardW / 2;
  const captionY = margin + pad + photoH + 96;
  ctx.font = '700 84px "Caveat", cursive';
  ctx.fillText(art.caption, cx, captionY);

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
