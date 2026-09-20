import type { Box, Hand, Landmark, Point } from "@/lib/camera/types";

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

/** Thumb tip and index tip closer than this (in normalised units) count as a pinch. */
export const PINCH_THRESHOLD = 0.055;
/** Extra pixels added around the two fingertips when framing a shot. */
export const FRAME_PADDING = 28;

function dist(a: Landmark, b: Landmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function isPinching(hand: Hand): boolean {
  return dist(hand[LM.THUMB_TIP], hand[LM.INDEX_TIP]) < PINCH_THRESHOLD;
}

/** A fist: all four fingertips are closer to the wrist than their knuckles are. */
export function isFist(hand: Hand): boolean {
  const wrist = hand[LM.WRIST];
  const fingers: [number, number][] = [
    [LM.INDEX_TIP, LM.INDEX_MCP],
    [LM.MIDDLE_TIP, LM.MIDDLE_MCP],
    [LM.RING_TIP, LM.RING_MCP],
    [LM.PINKY_TIP, LM.PINKY_MCP],
  ];
  return fingers.every(([tip, mcp]) => dist(hand[tip], wrist) < dist(hand[mcp], wrist));
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
