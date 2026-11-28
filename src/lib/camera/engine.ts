import {
  computeHandFrame,
  isFist,
  isPinching,
  LM,
  mirrorX,
  pinchPoint,
  pinchRatio,
  toPixel,
} from "@/lib/camera/gestures";
import {
  createPuzzle,
  findNearestPiece,
  handleDrag,
  isOverPiece,
  reconcile,
  stepTweens,
  swapPieces,
} from "@/lib/camera/pieces";
import { createSmoother, smoothPoint } from "@/lib/camera/smoothing";
import type { Smoother } from "@/lib/camera/smoothing";
import type { Puzzle, PuzzleEvent, Rand } from "@/lib/camera/pieces";
import type { Box, Hand, Point } from "@/lib/camera/types";

export const FREEZE_HOLD_MS = 250;
export const COUNTDOWN_SECONDS = 3;
/** How long a fist must be held to save (or start over). */
export const FIST_HOLD_MS = 600;
/** How long the last frame keeps showing after a hand briefly drops out of view. */
export const FRAME_GRACE_MS = 450;
/**
 * Smallest frame (in canvas pixels) that can be captured. Kept generous rather than a bare
 * minimum: the frame you draw with your fingers becomes the photo's actual resolution (there is
 * no upscaling at capture time), so a tiny frame produces a visibly low-quality photo once it is
 * printed or downloaded at a fixed print size later.
 */
export const MIN_FRAME_SIZE = 260;
/** How long a pinch must stay closed before it counts as a tap, so fingers brushing past can't
 * select anything. */
export const GRAB_MS = 60;
/** How long the fingers must stay open before the next pinch can count, so one noisy reading
 * can't turn a single pinch into two. */
export const RELEASE_MS = 130;
/** How long a hand can vanish from tracking (a blink of the detector) and keep its piece. */
export const HAND_LOST_GRACE_MS = 300;
/** A hand further than this (share of canvas width) from every known hand is treated as new. */
const HAND_MATCH_RATIO = 0.3;
/** Drag id used by the mouse or a finger on the canvas, as opposed to hands "A" and "B". */
const POINTER_ID = "pointer";

interface TrackedHand {
  id: string;
  smoother: Smoother;
  /** Smoothed pinch point in canvas pixels. */
  point: Point;
  pinching: boolean;
  /** When the fingers started looking closed (not yet a pinch), or null. */
  closedSince: number | null;
  /** When the fingers started looking open while still pinching, or null. */
  openSince: number | null;
  /** The piece under the pointer, kept until the pointer clearly leaves it. */
  hoverId: number | null;
  /** The piece that was under the pointer when the fingers began to close. Closing the fingers
   * moves the pointer a little, so this, not where it ends up, is what the player aimed at. */
  aimId: number | null;
  ratio: number;
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
  /** False when `hands` is a repeat of the last detection (the screen redraws faster than the
   * camera delivers frames). Gesture timing and smoothing only advance on fresh detections. */
  fresh?: boolean;
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
  /** One pointer per hand while solving: where a pinch would grab, and what it would grab. */
  cursors: HandCursor[];
  /** The piece picked by a first pinch, waiting for a second pinch on the piece to swap with. */
  selectedPieceId: number | null;
}

export interface HandCursor {
  point: Point;
  pinching: boolean;
  /** This hand is carrying a piece. */
  holding: boolean;
  /** The piece a pinch here would select or swap with, or null. */
  hoverPieceId: number | null;
  /** Thumb-to-index gap relative to hand size, for the ?debug overlay. */
  ratio: number;
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
  let fistSince: number | null = null;
  let fistProgress = 0;
  let handsSeen = 0;
  let armed = false;
  let fingertips: Point[] = [];
  let cursors: HandCursor[] = [];
  let moves = 0;
  let cleanDrops = 0;
  let puzzleStartedAt = 0;
  let solvedAt: number | null = null;
  let lastNow = 0;
  // Hands in the puzzle, tracked by position across frames. The detector's list order can swap
  // between frames, so "first hand in the list" is not a stable identity.
  let tracked: TrackedHand[] = [];
  let nextHandId = 0;
  let selectedId: number | null = null;

  function resetToTracking(): void {
    tracked = [];
    selectedId = null;
    phase = "tracking";
    puzzle = null;
    frameBox = null;
    freeze = { holding: false, since: 0 };
    countdownState = { startedAt: 0, box: null, lastN: -1, captured: false };
    fistSince = null;
    fistProgress = 0;
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
    fistSince = null;
    fistProgress = 0;
    if (phase === "puzzle" && puzzle && reconcile(puzzle)) {
      phase = "saving";
      events.push({ type: "save" });
      return;
    }
    resetToTracking();
    events.push({ type: "reset" });
  }

  /** The piece under `point`, sticking with the current one until the pointer clearly leaves it,
   * so the highlight doesn't flicker between two pieces along their shared edge. */
  function hoverAt(board: Puzzle, current: number | null, point: Point): number | null {
    if (board.drag || board.solved) return null;
    if (current !== null) {
      const piece = board.pieces[current];
      if (!piece.displacing && !piece.placed && isOverPiece(piece, point.x, point.y)) {
        return current;
      }
    }
    const piece = findNearestPiece(board, point.x, point.y);
    // Pieces already in their right spot are locked, so they never light up.
    return piece && !piece.placed ? piece.id : null;
  }

  /** One deliberate pinch on `target`: select it, cancel the selection, or swap with it. */
  function pinchTap(board: Puzzle, target: number | null, now: number, events: EngineEvent[]) {
    if (board.drag || board.solved || target === null) return;
    const piece = board.pieces[target];
    if (piece.placed || piece.displacing) return;
    if (selectedId === null) {
      selectedId = target;
      events.push({ type: "pickup" });
      return;
    }
    if (selectedId === target) {
      selectedId = null;
      return;
    }
    const first = board.pieces[selectedId];
    selectedId = null;
    applyPuzzleEvents(swapPieces(board, first, piece, now), now, events);
  }

  /** Matches this detection's hands to the tracked ones, then drags with each. */
  function updatePuzzleHands(
    board: Puzzle,
    hands: Hand[],
    frame: { now: number; width: number; height: number },
    events: EngineEvent[],
  ): void {
    const { now, width, height } = frame;
    const unmatched = [...tracked];
    const seen: TrackedHand[] = [];
    for (const hand of hands) {
      const raw = toPixel(mirrorX(pinchPoint(hand)), width, height);
      const ratio = pinchRatio(hand);
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
        match.point = smoothPoint(match.smoother, raw, now);
      } else {
        // A hand that arrives already pinched has to open first: it never grabs on the way in.
        match = {
          id: `hand${nextHandId++}`,
          smoother: createSmoother(raw, now),
          point: raw,
          pinching: isPinching(hand),
          closedSince: null,
          openSince: null,
          hoverId: null,
          aimId: null,
          ratio,
          at: now,
        };
      }
      match.at = now;
      match.ratio = ratio;

      const wasPinching = match.pinching;
      if (isPinching(hand, match.pinching)) {
        match.openSince = null;
        if (!match.pinching) {
          if (match.closedSince === null) {
            match.closedSince = now;
            match.aimId = match.hoverId;
          }
          if (now - match.closedSince >= GRAB_MS) match.pinching = true;
        }
      } else {
        match.closedSince = null;
        if (match.pinching) {
          match.openSince ??= now;
          if (now - match.openSince >= RELEASE_MS) {
            match.pinching = false;
            match.openSince = null;
          }
        }
      }
      seen.push(match);

      // Only the moment a pinch closes counts, aimed where the fingers began to close. Moving a
      // hand that is already pinched (or half-closed) over pieces never selects them.
      if (match.pinching && !wasPinching) pinchTap(board, match.aimId, now, events);
      if (!match.pinching && match.closedSince === null) match.aimId = null;
      if (match.closedSince === null) match.hoverId = hoverAt(board, match.hoverId, match.point);
    }
    // Keep briefly lost hands, so a blink of the tracker doesn't reset their pinch state.
    const kept = unmatched.filter((t) => now - t.at < HAND_LOST_GRACE_MS);
    tracked = [...seen, ...kept];
    fingertips = seen.map((t) => t.point);
    cursors = seen.map((t) => {
      const holding = board.drag?.handId === t.id;
      const hoverPieceId = holding || board.drag || board.solved ? null : (t.aimId ?? t.hoverId);
      return { point: t.point, pinching: t.pinching, holding, hoverPieceId, ratio: t.ratio };
    });
    if (!board.drag) reconcile(board);
  }

  /** Process one camera frame. Returns what happened, in order. */
  function update(frame: EngineFrame): EngineEvent[] {
    const { hands, now, width, height } = frame;
    const events: EngineEvent[] = [];
    lastNow = now;

    if (phase === "saving") return events;

    if (puzzle) stepTweens(puzzle, now);

    // A repeat of the last detection carries no new information about the hands: only advance
    // what runs on the clock. Counting repeats as new readings made gestures far too twitchy.
    if (frame.fresh === false) {
      if (phase === "countdown") tickCountdown(now, events);
      return events;
    }

    handsSeen = hands.length;
    cursors = [];
    fingertips = hands.map((h) => toPixel(mirrorX(h[LM.INDEX_TIP]), width, height));

    if (hands.length === 0) {
      fistSince = null;
      fistProgress = 0;
      freeze.holding = false;
      armed = false;
      if (phase === "puzzle" && puzzle) {
        // A hand that vanishes mid-drag keeps its piece for a moment, then lets go where it was.
        updatePuzzleHands(puzzle, hands, frame, events);
      } else if (phase === "countdown") {
        tickCountdown(now, events);
      } else if (phase === "tracking") {
        const grace = lastSeen.box !== null && now - lastSeen.at < FRAME_GRACE_MS;
        frameBox = grace ? lastSeen.box : null;
      }
      return events;
    }

    // A fist only counts when no hand is holding or pinching: a tight pinch can look like a fist.
    const busy = puzzle?.drag != null || tracked.some((t) => t.pinching);
    if (hands.some(isFist) && !busy && phase !== "tracking") {
      fistSince ??= now;
      fistProgress = Math.min(1, (now - fistSince) / FIST_HOLD_MS);
      if (now - fistSince >= FIST_HOLD_MS) {
        handleFist(events);
        return events;
      }
    } else {
      fistSince = null;
      fistProgress = 0;
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
      updatePuzzleHands(puzzle, hands, frame, events);
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
    fistSince = null;
    fistProgress = 0;
    tracked = [];
    selectedId = null;
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
    if (down) selectedId = null;
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
      fistProgress,
      fingertips,
      cursors: phase === "puzzle" ? cursors : [],
      selectedPieceId: phase === "puzzle" ? selectedId : null,
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
