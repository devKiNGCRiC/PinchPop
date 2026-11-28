import type { Box, Hand, Landmark, Point, WorldLandmark } from "@/lib/camera/types";

// Landmark indices into MediaPipe's 21-point hand model.
export const LM = {
  WRIST: 0,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_TIP: 20,
} as const;

/**
 * A pinch closes when the thumb-to-index gap drops below this share of the hand's size, and only
 * opens again above the larger value. Measuring against hand size keeps it the same whether the
 * hand is near the camera or far away; the gap between the two values (hysteresis) stops a hand
 * hovering near the line from flickering between "grab" and "let go".
 */
export const PINCH_CLOSE_RATIO = 0.42;
export const PINCH_OPEN_RATIO = 0.62;
/** Extra pixels added around the two fingertips when framing a shot. */
export const FRAME_PADDING = 28;

function dist(a: Landmark, b: Landmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function dist3(a: WorldLandmark, b: WorldLandmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

/**
 * Thumb-to-index gap divided by hand size (wrist to middle knuckle). Takes the smaller of the
 * flat (2D image) and 3D readings: the 3D one copes with a turned hand, but its depth guess is
 * shaky when the thumb sits behind the index finger, which is how most people pinch facing a
 * camera, and there the flat reading is the reliable one.
 */
export function pinchRatio(hand: Hand): number {
  const flat =
    dist(hand[LM.THUMB_TIP], hand[LM.INDEX_TIP]) /
    Math.max(dist(hand[LM.WRIST], hand[LM.MIDDLE_MCP]), 1e-6);
  const w = hand.world;
  if (!w || w.length <= LM.PINKY_TIP) return flat;
  const deep =
    dist3(w[LM.THUMB_TIP], w[LM.INDEX_TIP]) / Math.max(dist3(w[LM.WRIST], w[LM.MIDDLE_MCP]), 1e-6);
  return Math.min(flat, deep);
}

/** Pass `wasPinching` for a hand already holding a pinch, so it needs to open wider to let go. */
export function isPinching(hand: Hand, wasPinching = false): boolean {
  return pinchRatio(hand) < (wasPinching ? PINCH_OPEN_RATIO : PINCH_CLOSE_RATIO);
}

/** A fist: all four fingertips are closer to the wrist than their knuckles are. */
const FIST_FINGERS: [number, number][] = [
  [LM.INDEX_TIP, LM.INDEX_MCP],
  [LM.MIDDLE_TIP, LM.MIDDLE_MCP],
  [LM.RING_TIP, LM.RING_MCP],
  [LM.PINKY_TIP, LM.PINKY_MCP],
];

/** Checked in the flat image and, when available, in 3D: a fist facing the camera squashes the
 * flat picture, so either one seeing curled fingers is enough. */
export function isFist(hand: Hand): boolean {
  const flatWrist = hand[LM.WRIST];
  const flat = FIST_FINGERS.every(
    ([tip, mcp]) => dist(hand[tip], flatWrist) < dist(hand[mcp], flatWrist),
  );
  if (flat) return true;
  const w = hand.world;
  if (!w || w.length <= LM.PINKY_TIP) return false;
  return FIST_FINGERS.every(
    ([tip, mcp]) => dist3(w[tip], w[LM.WRIST]) < dist3(w[mcp], w[LM.WRIST]),
  );
}

/** The camera preview is drawn mirrored like a mirror, so landmarks flip horizontally to match. */
export function mirrorX(point: Landmark): Landmark {
  return { x: 1 - point.x, y: point.y };
}

export function toPixel(point: Landmark, width: number, height: number): Point {
  return { x: point.x * width, y: point.y * height };
}

/** The photo frame spanned by two fingertips (already mirrored), padded and clamped to the canvas. */
export function computeHandFrame(a: Landmark, b: Landmark, width: number, height: number): Box {
  const pa = toPixel(a, width, height);
  const pb = toPixel(b, width, height);
  const x = Math.max(0, Math.min(pa.x, pb.x) - FRAME_PADDING);
  const y = Math.max(0, Math.min(pa.y, pb.y) - FRAME_PADDING);
  const right = Math.min(width, Math.max(pa.x, pb.x) + FRAME_PADDING);
  const bottom = Math.min(height, Math.max(pa.y, pb.y) + FRAME_PADDING);
  return { x, y, width: right - x, height: bottom - y };
}
