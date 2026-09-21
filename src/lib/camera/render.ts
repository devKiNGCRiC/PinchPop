import { LM, isPinching, mirrorX, toPixel } from "@/lib/camera/gestures";
import type { EngineView } from "@/lib/camera/engine";
import type { Hand, Box } from "@/lib/camera/types";

const INK = "#111426";
const MARIGOLD = "#ffc61a";
const SAFFRON = "#ff9933";
const LEAF = "#138808";

const HAND_CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [0, 17],
];

const FLASH_MS = 380;
/** How long the finished photo takes to burst apart when it is saved. */
export const SHATTER_MS = 1100;
const SHATTER_COLS = 8;
const SHATTER_ROWS = 5;
const GRAVITY = 900;

interface Fragment {
  /** Source rectangle in the colour photo. */
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  /** Size on the canvas. */
  w: number;
  h: number;
  /** Starting centre, velocity (px per second) and spin (radians per second). */
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
}

/** The burst that plays when a solved photo is saved (GAME-05). */
export interface Shatter {
  startedAt: number;
  source: HTMLCanvasElement;
  fragments: Fragment[];
}

export function createShatter(box: Box, source: HTMLCanvasElement, now: number): Shatter {
  const fw = box.width / SHATTER_COLS;
  const fh = box.height / SHATTER_ROWS;
  const scaleX = source.width / box.width;
  const scaleY = source.height / box.height;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const fragments: Fragment[] = [];
  for (let row = 0; row < SHATTER_ROWS; row++) {
    for (let col = 0; col < SHATTER_COLS; col++) {
      const x = box.x + col * fw + fw / 2;
      const y = box.y + row * fh + fh / 2;
      const dx = x - cx;
      const dy = y - cy;
      const distance = Math.hypot(dx, dy) || 1;
      const speed = 220 + Math.random() * 420;
      fragments.push({
        sx: col * fw * scaleX,
        sy: row * fh * scaleY,
        sw: fw * scaleX,
        sh: fh * scaleY,
        w: fw,
        h: fh,
        x,
        y,
        vx: (dx / distance) * speed + (Math.random() - 0.5) * 120,
        vy: (dy / distance) * speed - 120 * Math.random(),
        spin: (Math.random() - 0.5) * 9,
      });
    }
  }
  return { startedAt: now, source, fragments };
}

function drawShatter(ctx: CanvasRenderingContext2D, shatter: Shatter, now: number) {
  const t = (now - shatter.startedAt) / 1000;
  const alpha = Math.max(0, 1 - Math.pow(t / (SHATTER_MS / 1000), 2));
  if (alpha <= 0) return;
  for (const f of shatter.fragments) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(f.x + f.vx * t, f.y + f.vy * t + 0.5 * GRAVITY * t * t);
    ctx.rotate(f.spin * t);
    ctx.drawImage(shatter.source, f.sx, f.sy, f.sw, f.sh, -f.w / 2, -f.h / 2, f.w, f.h);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.strokeRect(-f.w / 2, -f.h / 2, f.w, f.h);
    ctx.restore();
  }
}
export const REVEAL_MS = 700;

export interface SceneAssets {
  /** Black-and-white pieces, indexed by piece id. */
  pieces: HTMLCanvasElement[];
  /** The finished colour photo. */
  color: HTMLCanvasElement;
}

export interface SceneArgs {
  video: HTMLVideoElement;
  hands: Hand[];
  view: EngineView;
  assets: SceneAssets | null;
  now: number;
  /** When the shutter last fired, for the flash. */
  flashAt: number | null;
  /** When the puzzle was solved, for the colour reveal. */
  solvedAt: number | null;
  /** The save animation, once the player has saved a solved photo. */
  shatter: Shatter | null;
}

function drawMirroredVideo(ctx: CanvasRenderingContext2D, video: HTMLVideoElement): void {
  const { width, height } = ctx.canvas;
  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, width, height);
  ctx.restore();
}

/** Four viewfinder corner brackets around a box. */
function drawBrackets(ctx: CanvasRenderingContext2D, box: Box, color: string, lineWidth: number) {
  const len = Math.min(34, box.width / 3, box.height / 3);
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 2;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  const corners: [number, number, number, number][] = [
    [box.x, box.y, 1, 1],
    [box.x + box.width, box.y, -1, 1],
    [box.x, box.y + box.height, 1, -1],
    [box.x + box.width, box.y + box.height, -1, -1],
  ];
  for (const [cx, cy, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + len * dy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + len * dx, cy);
    ctx.stroke();
  }
  ctx.restore();
}

/** Dims everything outside the frame and shows the "photobooth" look inside it. */
function drawFramePreview(ctx: CanvasRenderingContext2D, video: HTMLVideoElement, box: Box) {
  const { width, height } = ctx.canvas;
  ctx.save();
  ctx.fillStyle = "rgba(17,20,38,0.38)";
  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.rect(box.x, box.y, box.width, box.height);
  ctx.fill("evenodd");
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.width, box.height);
  ctx.clip();
  ctx.filter = "contrast(1.3) brightness(1.05) saturate(1.1)";
  drawMirroredVideo(ctx, video);
  ctx.restore();
}

function drawFingertip(ctx: CanvasRenderingContext2D, x: number, y: number, active: boolean) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, active ? 11 : 14, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = active ? SAFFRON : INK;
  ctx.stroke();
  ctx.restore();
}

function drawSkeleton(ctx: CanvasRenderingContext2D, hand: Hand) {
  const { width, height } = ctx.canvas;
  const points = hand.map((p) => toPixel(mirrorX(p), width, height));
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.shadowColor = "rgba(17,20,38,0.6)";
  ctx.shadowBlur = 6;
  ctx.lineWidth = 3;
  for (const [a, b] of HAND_CONNECTIONS) {
    ctx.beginPath();
    ctx.moveTo(points[a].x, points[a].y);
    ctx.lineTo(points[b].x, points[b].y);
    ctx.stroke();
  }
  ctx.restore();
  drawFingertip(ctx, points[LM.INDEX_TIP].x, points[LM.INDEX_TIP].y, isPinching(hand));
}

function drawCountdown(ctx: CanvasRenderingContext2D, box: Box, n: number) {
  ctx.save();
  ctx.fillStyle = "rgba(17,20,38,0.35)";
  ctx.fillRect(box.x, box.y, box.width, box.height);
  const size = Math.max(64, Math.min(box.width, box.height) * 0.6);
  ctx.font = `800 ${size}px Unbounded, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.lineWidth = size * 0.12;
  ctx.strokeStyle = INK;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  ctx.strokeText(String(n), cx, cy);
  ctx.fillStyle = SAFFRON;
  ctx.fillText(String(n), cx, cy);
  ctx.restore();
}

function drawPuzzle(ctx: CanvasRenderingContext2D, args: SceneArgs) {
  const { view, assets, now, solvedAt } = args;
  const puzzle = view.puzzle;
  if (!puzzle || !assets) return;
  const { box } = puzzle;

  ctx.save();
  ctx.fillStyle = INK;
  ctx.fillRect(box.x, box.y, box.width, box.height);
  ctx.strokeStyle = "rgba(255,198,26,0.22)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(box.x + i * puzzle.tileW, box.y);
    ctx.lineTo(box.x + i * puzzle.tileW, box.y + box.height);
    ctx.moveTo(box.x, box.y + i * puzzle.tileH);
    ctx.lineTo(box.x + box.width, box.y + i * puzzle.tileH);
    ctx.stroke();
  }
  ctx.restore();

  const drawOrder = [...puzzle.pieces].sort((a, b) => Number(a.dragging) - Number(b.dragging));
  for (const piece of drawOrder) {
    ctx.save();
    if (piece.dragging) {
      ctx.shadowColor = MARIGOLD;
      ctx.shadowBlur = 18;
    }
    ctx.drawImage(assets.pieces[piece.id], piece.x, piece.y, piece.w, piece.h);
    ctx.lineWidth = piece.dragging ? 4 : 2;
    ctx.strokeStyle = piece.placed ? LEAF : piece.dragging ? MARIGOLD : "rgba(255,255,255,0.55)";
    ctx.strokeRect(piece.x, piece.y, piece.w, piece.h);
    ctx.restore();
  }

  // On completion the black-and-white pieces develop into the colour photo.
  if (puzzle.solved && solvedAt !== null) {
    const alpha = Math.min(1, (now - solvedAt) / REVEAL_MS);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(assets.color, box.x, box.y, box.width, box.height);
    ctx.restore();
  }

  ctx.save();
  ctx.lineWidth = 5;
  ctx.strokeStyle = puzzle.solved ? LEAF : MARIGOLD;
  ctx.strokeRect(box.x, box.y, box.width, box.height);
  ctx.restore();
}

/** Paints one frame of camera mode. Pure drawing: all game decisions live in the engine. */
export function renderScene(ctx: CanvasRenderingContext2D, args: SceneArgs): void {
  const { video, hands, view, now, flashAt } = args;
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  drawMirroredVideo(ctx, video);

  if (view.phase === "tracking") {
    if (view.frameBox) {
      drawFramePreview(ctx, video, view.frameBox);
      drawBrackets(ctx, view.frameBox, view.armed ? SAFFRON : MARIGOLD, view.armed ? 7 : 5);
    }
    view.fingertips.forEach((tip, i) =>
      drawFingertip(ctx, tip.x, tip.y, hands[i] ? isPinching(hands[i]) : false),
    );
  } else if (view.phase === "countdown" && view.countdownBox) {
    drawFramePreview(ctx, video, view.countdownBox);
    drawBrackets(ctx, view.countdownBox, SAFFRON, 7);
    if (view.countdown !== null) drawCountdown(ctx, view.countdownBox, view.countdown);
  } else if (view.phase === "saving" && args.shatter) {
    drawShatter(ctx, args.shatter, now);
  } else if (view.phase === "puzzle" || view.phase === "saving") {
    drawPuzzle(ctx, args);
    if (view.phase === "puzzle") hands.forEach((hand) => drawSkeleton(ctx, hand));
  }

  if (flashAt !== null) {
    const alpha = 1 - (now - flashAt) / FLASH_MS;
    if (alpha > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }
}
