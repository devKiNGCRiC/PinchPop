import type { Box } from "@/lib/camera/types";
import type { Puzzle } from "@/lib/camera/pieces";

const CONTRAST = 1.3;
const BRIGHTNESS = 10;
const NOISE_STD = 15;
/** Longest side of the photo kept in the album, in pixels. Keeps storage small. */
const SAVED_MAX_SIDE = 720;

function gaussianNoise(std: number): number {
  const u1 = Math.random() || 1e-6;
  const u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * std;
}

const clamp = (v: number) => Math.max(0, Math.min(255, v));

/** The "photobooth" look: punchy contrast and a little film grain, in colour or black and white. */
function photobooth(image: ImageData, blackAndWhite: boolean): void {
  const d = image.data;
  for (let i = 0; i < d.length; i += 4) {
    const noise = gaussianNoise(NOISE_STD);
    if (blackAndWhite) {
      const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      d[i] = d[i + 1] = d[i + 2] = clamp(gray * CONTRAST + BRIGHTNESS + noise);
    } else {
      d[i] = clamp(d[i] * CONTRAST + BRIGHTNESS + noise);
      d[i + 1] = clamp(d[i + 1] * CONTRAST + BRIGHTNESS + noise);
      d[i + 2] = clamp(d[i + 2] * CONTRAST + BRIGHTNESS + noise);
    }
  }
}

function vignette(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = canvas;
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.35,
    width / 2,
    height / 2,
    Math.hypot(width, height) / 2,
  );
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

export interface CapturedPhoto {
  /** The finished colour photo, shown when the puzzle is solved and saved to the album. */
  color: HTMLCanvasElement;
  /** Black-and-white source the puzzle pieces are cut from. */
  blackAndWhite: HTMLCanvasElement;
}

/** Grabs the framed region of the (mirrored) video and prepares its colour and B&W versions. */
export function capturePhoto(video: HTMLVideoElement, box: Box): CapturedPhoto {
  const frame = makeCanvas(video.videoWidth, video.videoHeight);
  const frameCtx = frame.getContext("2d");
  if (!frameCtx) throw new Error("Canvas is not available in this browser.");
  frameCtx.translate(frame.width, 0);
  frameCtx.scale(-1, 1);
  frameCtx.drawImage(video, 0, 0, frame.width, frame.height);

  const crop = makeCanvas(box.width, box.height);
  const cropCtx = crop.getContext("2d", { willReadFrequently: true });
  if (!cropCtx) throw new Error("Canvas is not available in this browser.");
  cropCtx.drawImage(frame, box.x, box.y, box.width, box.height, 0, 0, crop.width, crop.height);

  const colorData = cropCtx.getImageData(0, 0, crop.width, crop.height);
  photobooth(colorData, false);
  const color = makeCanvas(crop.width, crop.height);
  color.getContext("2d")?.putImageData(colorData, 0, 0);
  vignette(color);

  const bwData = cropCtx.getImageData(0, 0, crop.width, crop.height);
  photobooth(bwData, true);
  cropCtx.putImageData(bwData, 0, 0);
  vignette(crop);

  return { color, blackAndWhite: crop };
}

/** Cuts the black-and-white photo into one canvas per puzzle piece, indexed by piece id. */
export function slicePieces(source: HTMLCanvasElement, puzzle: Puzzle): HTMLCanvasElement[] {
  return puzzle.pieces.map((piece) => {
    const canvas = makeCanvas(piece.w, piece.h);
    canvas
      .getContext("2d")
      ?.drawImage(
        source,
        piece.col * puzzle.tileW,
        piece.row * puzzle.tileH,
        piece.w,
        piece.h,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    return canvas;
  });
}

export interface SavedPhoto {
  dataUrl: string;
  /** Width divided by height. */
  aspect: number;
}

/** A small JPEG of the finished colour photo, cheap enough to keep in local storage. */
export function toSavedPhoto(color: HTMLCanvasElement): SavedPhoto {
  const scale = Math.min(1, SAVED_MAX_SIDE / Math.max(color.width, color.height));
  const out = makeCanvas(color.width * scale, color.height * scale);
  out.getContext("2d")?.drawImage(color, 0, 0, out.width, out.height);
  return { dataUrl: out.toDataURL("image/jpeg", 0.82), aspect: out.width / out.height };
}
