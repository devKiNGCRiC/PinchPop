import type { Box } from "@/lib/camera/types";
import type { Puzzle } from "@/lib/camera/pieces";

const CONTRAST = 1.3;
const BRIGHTNESS = 10;
// Subtle film grain, not visible noise — tuned low enough that it still reads as "instant film"
// once printed, rather than looking like compression artefacts on a soft source photo.
const NOISE_STD = 7;
/** Longest side of the photo kept in the album, in pixels. Keeps storage small without capping
 * resolution below what a well-framed shot actually captures (matches the 1080p camera request
 * in media.ts, so a full-canvas frame is not downscaled and then upscaled again on export). */
const SAVED_MAX_SIDE = 1080;
const SAVED_JPEG_QUALITY = 0.9;
/** Longest side of an uploaded photo's working canvas. Capped well above SAVED_MAX_SIDE so a
 * phone photo stays smooth to drag and animate as puzzle pieces, not just small once saved. */
const UPLOAD_MAX_SIDE = 1600;
/** Generous but not unbounded, so one huge phone photo can't blow the localStorage quota. */
export const UPLOAD_MAX_BYTES = 15 * 1024 * 1024;

export function loadImageFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    image.src = url;
  });
}

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

/** A 2D context with the best resampling quality this browser has, for any scaled drawImage. */
function highQualityContext(
  canvas: HTMLCanvasElement,
  options?: CanvasRenderingContext2DSettings,
): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d", options);
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return ctx;
}

export interface CapturedPhoto {
  /** The finished colour photo, shown when the puzzle is solved and saved to the album. */
  color: HTMLCanvasElement;
  /** Black-and-white source the puzzle pieces are cut from. */
  blackAndWhite: HTMLCanvasElement;
}

/** Crops a captured frame and prepares its colour and B&W photobooth versions. */
function processFrame(frame: HTMLCanvasElement, box: Box): CapturedPhoto {
  const crop = makeCanvas(box.width, box.height);
  const cropCtx = highQualityContext(crop, { willReadFrequently: true });
  cropCtx.drawImage(frame, box.x, box.y, box.width, box.height, 0, 0, crop.width, crop.height);

  const colorData = cropCtx.getImageData(0, 0, crop.width, crop.height);
  photobooth(colorData, false);
  const color = makeCanvas(crop.width, crop.height);
  highQualityContext(color).putImageData(colorData, 0, 0);
  vignette(color);

  const bwData = cropCtx.getImageData(0, 0, crop.width, crop.height);
  photobooth(bwData, true);
  cropCtx.putImageData(bwData, 0, 0);
  vignette(crop);

  return { color, blackAndWhite: crop };
}

/** Grabs the framed region of the (mirrored) video and prepares its colour and B&W versions. */
export function capturePhoto(video: HTMLVideoElement, box: Box): CapturedPhoto {
  const frame = makeCanvas(video.videoWidth, video.videoHeight);
  const frameCtx = highQualityContext(frame);
  frameCtx.translate(frame.width, 0);
  frameCtx.scale(-1, 1);
  frameCtx.drawImage(video, 0, 0, frame.width, frame.height);
  return processFrame(frame, box);
}

/** Prepares an uploaded photo the same way as a camera capture, minus the mirroring (it is
 * already right-way-round) and the hand-framing (the whole photo is the frame). */
export function capturePhotoFromImage(image: HTMLImageElement): CapturedPhoto {
  const scale = Math.min(1, UPLOAD_MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
  const frame = makeCanvas(image.naturalWidth * scale, image.naturalHeight * scale);
  highQualityContext(frame).drawImage(image, 0, 0, frame.width, frame.height);
  return processFrame(frame, { x: 0, y: 0, width: frame.width, height: frame.height });
}

/** Resizes an uploaded photo like capturePhotoFromImage, but without baking in the photobooth
 * grain/contrast/vignette — for the no-game polaroid tool, where the chosen filter preset (which
 * includes a literal "none") is meant to be the only styling applied, so "Default" actually looks
 * like the photo that was uploaded. */
export function preparePlainPhoto(image: HTMLImageElement): HTMLCanvasElement {
  const scale = Math.min(1, UPLOAD_MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = makeCanvas(image.naturalWidth * scale, image.naturalHeight * scale);
  highQualityContext(canvas).drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/** Cuts the black-and-white photo into one canvas per puzzle piece, indexed by piece id. */
export function slicePieces(source: HTMLCanvasElement, puzzle: Puzzle): HTMLCanvasElement[] {
  return puzzle.pieces.map((piece) => {
    const canvas = makeCanvas(piece.w, piece.h);
    highQualityContext(canvas).drawImage(
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

/** A JPEG of the finished colour photo, downsized only if it is larger than needed for the album. */
export function toSavedPhoto(color: HTMLCanvasElement): SavedPhoto {
  const scale = Math.min(1, SAVED_MAX_SIDE / Math.max(color.width, color.height));
  const out = makeCanvas(color.width * scale, color.height * scale);
  highQualityContext(out).drawImage(color, 0, 0, out.width, out.height);
  return {
    dataUrl: out.toDataURL("image/jpeg", SAVED_JPEG_QUALITY),
    aspect: out.width / out.height,
  };
}
