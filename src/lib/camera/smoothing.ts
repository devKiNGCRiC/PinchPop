import type { Point } from "@/lib/camera/types";

// One Euro filter (Casiez, Roussel & Vogel, CHI 2012): a low-pass filter whose cutoff rises with
// speed. A still hand gets heavy smoothing (no shake); a moving hand gets almost none (no lag).

/** Cutoff (Hz) when the hand is still. Lower is steadier. */
export const SMOOTH_MIN_CUTOFF = 3;
/** How fast the cutoff rises with speed (per canvas pixel per second). Higher is snappier. */
export const SMOOTH_BETA = 0.07;
const DERIVATIVE_CUTOFF = 1;

export interface Smoother {
  x: number;
  y: number;
  dx: number;
  dy: number;
  t: number;
}

function alpha(cutoff: number, dt: number): number {
  const tau = 1 / (2 * Math.PI * cutoff);
  return 1 / (1 + tau / dt);
}

export function createSmoother(point: Point, now: number): Smoother {
  return { x: point.x, y: point.y, dx: 0, dy: 0, t: now };
}

/** How far ahead (ms) the pointer is drawn along the hand's motion, to hide the camera's own
 * delay (capture plus hand detection), and the most it may lead by, in canvas pixels. */
export const POINTER_LEAD_MS = 45;
const MAX_LEAD_PX = 50;

/** The smoothed point nudged forward along the current velocity. A still hand has ~0 velocity,
 * so this only acts while moving, and the cap keeps a sudden stop from overshooting much. */
export function leadPoint(s: Smoother): Point {
  let ox = s.dx * (POINTER_LEAD_MS / 1000);
  let oy = s.dy * (POINTER_LEAD_MS / 1000);
  const len = Math.hypot(ox, oy);
  if (len > MAX_LEAD_PX) {
    ox *= MAX_LEAD_PX / len;
    oy *= MAX_LEAD_PX / len;
  }
  return { x: s.x + ox, y: s.y + oy };
}

/** Feeds one new sample (call once per camera detection, not per screen frame). */
export function smoothPoint(s: Smoother, point: Point, now: number): Point {
  const dt = Math.max((now - s.t) / 1000, 1 / 240);
  const ad = alpha(DERIVATIVE_CUTOFF, dt);
  s.dx += ad * ((point.x - s.x) / dt - s.dx);
  s.dy += ad * ((point.y - s.y) / dt - s.dy);
  const a = alpha(SMOOTH_MIN_CUTOFF + SMOOTH_BETA * Math.hypot(s.dx, s.dy), dt);
  s.x += a * (point.x - s.x);
  s.y += a * (point.y - s.y);
  s.t = now;
  return { x: s.x, y: s.y };
}
