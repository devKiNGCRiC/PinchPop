import {
  computeHandFrame,
  isFist,
  isPinching,
  LM,
  mirrorX,
  pinchPoint,
  toPixel,
} from "@/lib/camera/gestures";
import { createPuzzle, handleDrag, reconcile, stepTweens } from "@/lib/camera/pieces";
import type { Puzzle, PuzzleEvent, Rand } from "@/lib/camera/pieces";
import type { Box, Hand, Point } from "@/lib/camera/types";

export const FREEZE_HOLD_MS = 250;
export const COUNTDOWN_SECONDS = 3;
export const FIST_HOLD_FRAMES = 12;
/** How long the last frame keeps showing after a hand briefly drops out of view. */
export const FRAME_GRACE_MS = 450;
/**
 * Smallest frame (in canvas pixels) that can be captured. Kept generous rather than a bare
 * minimum: the frame you draw with your fingers becomes the photo's actual resolution (there is
 * no upscaling at capture time), so a tiny frame produces a visibly low-quality photo once it is
 * printed or downloaded at a fixed print size later.
 */
export const MIN_FRAME_SIZE = 260;
/** How much of each new hand position the puzzle cursor moves toward per frame (0..1). Lower is
 * steadier but laggier; this takes the shake out of hand tracking without feeling slow. */
export const CURSOR_SMOOTHING = 0.45;
/** Frames a pinch must stay open before a held piece is let go, so one noisy frame can't drop it. */
export const RELEASE_FRAMES = 3;
/** How long a hand can vanish from tracking (a blink of the detector) and keep its piece. */
export const HAND_LOST_GRACE_MS = 300;
/** A hand further than this (share of canvas width) from every known hand is treated as new. */
const HAND_MATCH_RATIO = 0.3;
/** Drag id used by the mouse or a finger on the canvas, as opposed to hands "A" and "B". */
const POINTER_ID = "pointer";

interface TrackedHand {
  id: string;
  /** Smoothed pinch point in canvas pixels. */
  point: Point;
  pinching: boolean;
  /** Consecutive frames the pinch has looked open while still holding. */
  openFrames: number;
  /** When this hand was last detected. */
  at: number;
}

export type Phase = "tracking" | "countdown" | "puzzle" | "saving";
export type Status =
  "looking" | "tracking" | "armed" | "countdown" | "puzzle" | "solved" | "saving";

export type EngineEvent =
  | { type: "countdown"; n: number }
  | { type: "capture"; box: Box }
  | { type: "pickup" }
  | { type: "drop" }
  | { type: "snap" }
  | { type: "complete" }
  | { type: "save" }
  | { type: "reset" };

export interface EngineFrame {
  hands: Hand[];
  now: number;
  width: number;
  height: number;
}

/** Everything the renderer and HUD need, read once per frame. */
export interface EngineView {
  phase: Phase;
  status: Status;
  handsSeen: number;
  /** The live photo frame while framing, or the just-lost frame during the grace period. */
  frameBox: Box | null;
  /** Both fingertips are pinched and the shutter is about to arm. */
  armed: boolean;
  countdown: number | null;
  countdownBox: Box | null;
  puzzle: Puzzle | null;
  fistProgress: number;
  /** Mirrored index fingertips in canvas pixels, for the framing markers. */
  fingertips: Point[];
}

export interface RunStats {
  moves: number;
  seconds: number;
  /** Share of drops that landed a piece in its right place, from 0 to 1. */
  accuracy: number;
}

/**
 * The camera-mode state machine: tracking, countdown, puzzle, saving. It only does geometry and
 * timing, so it runs (and is tested) without a canvas or a camera. The caller supplies hands per
 * frame and reacts to the returned events (for example, "capture" needs a real video frame).
 */
export function createEngine() {
  let phase: Phase = "tracking";
  let puzzle: Puzzle | null = null;
  let frameBox: Box | null = null;
  let lastSeen: { box: Box | null; at: number } = { box: null, at: 0 };
  let freeze = { holding: false, since: 0 };
  let countdownState = { startedAt: 0, box: null as Box | null, lastN: -1, captured: false };
  let fistFrames = 0;
  let handsSeen = 0;
  let armed = false;
  let fingertips: Point[] = [];
  let moves = 0;
  let cleanDrops = 0;
  let puzzleStartedAt = 0;
  let solvedAt: number | null = null;
  let lastNow = 0;
  // Hands in the puzzle, tracked by position across frames. The detector's list order can swap
  // between frames, so "first hand in the list" is not a stable identity.
  let tracked: TrackedHand[] = [];
  let nextHandId = 0;

  function resetToTracking(): void {
    tracked = [];
    phase = "tracking";
    puzzle = null;
    frameBox = null;
    freeze = { holding: false, since: 0 };
    countdownState = { startedAt: 0, box: null, lastN: -1, captured: false };
    fistFrames = 0;
    armed = false;
    moves = 0;
    cleanDrops = 0;
    solvedAt = null;
  }

  function startCountdown(box: Box, now: number): void {
    phase = "countdown";
    countdownState = { startedAt: now, box: { ...box }, lastN: -1, captured: false };
    freeze.holding = false;
    armed = false;
  }

  function tickCountdown(now: number, events: EngineEvent[]): void {
    const remaining = COUNTDOWN_SECONDS - (now - countdownState.startedAt) / 1000;
    if (remaining <= 0) {
      if (!countdownState.captured && countdownState.box) {
        countdownState.captured = true;
        events.push({ type: "capture", box: countdownState.box });
      }
      return;
    }
    const n = Math.ceil(remaining);
    if (n !== countdownState.lastN) {
      countdownState.lastN = n;
      events.push({ type: "countdown", n });
    }
  }

  function applyPuzzleEvents(list: PuzzleEvent[], now: number, events: EngineEvent[]): void {
    for (const name of list) {
      if (name === "drop") moves += 1;
      if (name === "snap") cleanDrops += 1;
      if (name === "complete") solvedAt = now;
      events.push({ type: name });
    }
  }

  function handleFist(events: EngineEvent[]): void {
    fistFrames = 0;
    if (phase === "puzzle" && puzzle && reconcile(puzzle)) {
      phase = "saving";
      events.push({ type: "save" });
      return;
    }
    resetToTracking();
    events.push({ type: "reset" });
  }

  /** Matches this frame's hands to the tracked ones, then drags with each. */
  function updatePuzzleHands(
    board: Puzzle,
    hands: Hand[],
    frame: { now: number; width: number; height: number },
    rand: Rand,
    events: EngineEvent[],
  ): void {
    const { now, width, height } = frame;
    const unmatched = [...tracked];
    const seen: TrackedHand[] = [];
    for (const hand of hands) {
      const raw = toPixel(mirrorX(pinchPoint(hand)), width, height);
      let match: TrackedHand | null = null;
      let best = width * HAND_MATCH_RATIO;
      for (const t of unmatched) {
        const d = Math.hypot(raw.x - t.point.x, raw.y - t.point.y);
        if (d < best) {
          best = d;
          match = t;
        }
      }
      if (match) {
        unmatched.splice(unmatched.indexOf(match), 1);
        match.point = {
          x: match.point.x + (raw.x - match.point.x) * CURSOR_SMOOTHING,
          y: match.point.y + (raw.y - match.point.y) * CURSOR_SMOOTHING,
        };
      } else {
        match = { id: `hand${nextHandId++}`, point: raw, pinching: false, openFrames: 0, at: now };
      }
      match.at = now;
      if (isPinching(hand, match.pinching)) {
        match.pinching = true;
        match.openFrames = 0;
      } else if (match.pinching) {
        match.openFrames += 1;
        if (match.openFrames >= RELEASE_FRAMES) match.pinching = false;
      }
      seen.push(match);
      applyPuzzleEvents(
        handleDrag(board, match.id, match.pinching, match.point, now, rand),
        now,
        events,
      );
    }
    // Keep briefly lost hands (and their piece); let go once they've been gone too long.
    const kept = unmatched.filter((t) => now - t.at < HAND_LOST_GRACE_MS);
    const active = board.drag;
    if (active && active.handId !== POINTER_ID) {
      const holder = [...seen, ...kept].find((t) => t.id === active.handId);
      if (!holder) {
        const held = board.pieces[active.pieceId];
        applyPuzzleEvents(
          handleDrag(board, active.handId, false, { x: held.x, y: held.y }, now, rand),
          now,
          events,
        );
      }
    }
    tracked = [...seen, ...kept];
    fingertips = seen.map((t) => t.point);
    if (!board.drag) reconcile(board);
  }

  /** Process one camera frame. Returns what happened, in order. */
  function update(frame: EngineFrame, rand: Rand): EngineEvent[] {
    const { hands, now, width, height } = frame;
    const events: EngineEvent[] = [];
    lastNow = now;
    handsSeen = hands.length;
    fingertips = hands.map((h) => toPixel(mirrorX(h[LM.INDEX_TIP]), width, height));

    if (phase === "saving") return events;

    if (puzzle) stepTweens(puzzle, now);

    if (hands.length === 0) {
      fistFrames = 0;
      freeze.holding = false;
      armed = false;
      if (phase === "puzzle" && puzzle) {
        // A hand that vanishes mid-drag keeps its piece for a moment, then lets go where it was.
        updatePuzzleHands(puzzle, hands, frame, rand, events);
      } else if (phase === "countdown") {
        tickCountdown(now, events);
      } else if (phase === "tracking") {
        const grace = lastSeen.box !== null && now - lastSeen.at < FRAME_GRACE_MS;
        frameBox = grace ? lastSeen.box : null;
      }
      return events;
    }

    const dragging = puzzle?.drag != null;
    if (hands.some(isFist) && !dragging && phase !== "tracking") {
      fistFrames += 1;
      if (fistFrames >= FIST_HOLD_FRAMES) {
        handleFist(events);
        return events;
      }
    } else {
      fistFrames = 0;
    }

    if (phase === "tracking") {
      if (hands.length === 2) {
        const a = mirrorX(hands[0][LM.INDEX_TIP]);
        const b = mirrorX(hands[1][LM.INDEX_TIP]);
        const box = computeHandFrame(a, b, width, height);
        if (box.width > 4 && box.height > 4) {
          frameBox = box;
          lastSeen = { box, at: now };
        } else {
          frameBox = null;
        }
        const bothPinching = isPinching(hands[0]) && isPinching(hands[1]);
        if (bothPinching && box.width > MIN_FRAME_SIZE && box.height > MIN_FRAME_SIZE) {
          if (!freeze.holding) freeze = { holding: true, since: now };
          armed = true;
          if (now - freeze.since > FREEZE_HOLD_MS) startCountdown(box, now);
        } else {
          freeze.holding = false;
          armed = false;
        }
      } else {
        freeze.holding = false;
        armed = false;
        const grace = lastSeen.box !== null && now - lastSeen.at < FRAME_GRACE_MS;
        frameBox = grace ? lastSeen.box : null;
      }
      return events;
    }

    if (phase === "countdown") {
      tickCountdown(now, events);
      return events;
    }

    if (phase === "puzzle" && puzzle) {
      updatePuzzleHands(puzzle, hands, frame, rand, events);
    }
    return events;
  }

  /** Manual "snap now": frames the shot without hands. Only valid while tracking. */
  function requestCapture(box: Box, now: number): boolean {
    if (phase !== "tracking") return false;
    if (box.width <= MIN_FRAME_SIZE || box.height <= MIN_FRAME_SIZE) return false;
    startCountdown(box, now);
    return true;
  }

  /** Called once the captured frame has been cut into pieces. */
  function beginPuzzle(box: Box, now: number, rand: Rand): Puzzle {
    puzzle = createPuzzle(box, rand);
    phase = "puzzle";
    fistFrames = 0;
    tracked = [];
    moves = 0;
    cleanDrops = 0;
    puzzleStartedAt = now;
    solvedAt = puzzle.solved ? now : null;
    return puzzle;
  }

  /** The mouse or a finger on the canvas, acting as a single pinching pointer. */
  function pointer(down: boolean, point: Point, now: number, rand: Rand): EngineEvent[] {
    const events: EngineEvent[] = [];
    if (phase !== "puzzle" || !puzzle) return events;
    applyPuzzleEvents(handleDrag(puzzle, POINTER_ID, down, point, now, rand), now, events);
    if (!puzzle.drag) reconcile(puzzle);
    return events;
  }

  /** Manual "save": valid only once the puzzle is solved. */
  function requestSave(): boolean {
    if (phase !== "puzzle" || !puzzle || !reconcile(puzzle)) return false;
    phase = "saving";
    return true;
  }

  function stats(): RunStats {
    const end = solvedAt ?? lastNow;
    return {
      moves,
      seconds: Math.max(0, Math.round((end - puzzleStartedAt) / 1000)),
      accuracy: moves === 0 ? 1 : Math.min(1, cleanDrops / moves),
    };
  }

  function view(): EngineView {
    const countdown =
      phase === "countdown" && !countdownState.captured && countdownState.lastN > 0
        ? countdownState.lastN
        : null;
    let status: Status;
    if (phase === "saving") status = "saving";
    else if (phase === "countdown") status = "countdown";
    else if (phase === "puzzle") status = puzzle?.solved ? "solved" : "puzzle";
    else if (handsSeen === 0) status = "looking";
    else status = armed ? "armed" : "tracking";

    return {
      phase,
      status,
      handsSeen,
      frameBox: phase === "tracking" ? frameBox : null,
      armed,
      countdown,
      countdownBox: phase === "countdown" ? countdownState.box : null,
      puzzle,
      fistProgress: Math.min(1, fistFrames / FIST_HOLD_FRAMES),
      fingertips,
    };
  }

  return {
    update,
    requestCapture,
    beginPuzzle,
    pointer,
    requestSave,
    reset: resetToTracking,
    stats,
    view,
  };
}

export type Engine = ReturnType<typeof createEngine>;
