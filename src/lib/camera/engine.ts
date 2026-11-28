import {
  computeHandFrame,
  isFist,
  isPinching,
  LM,
  PINCH_CLOSE_RATIO,
  mirrorX,
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
export const GRAB_MS = 30;
/** How long the fingers must stay open before the next pinch can count, so one noisy reading
 * can't turn a single pinch into two. */
export const RELEASE_MS = 130;
/** A pinch is aimed at the piece the fingertip was on this long before the fingers closed:
 * closing the fingers pulls the fingertip toward the thumb, often onto the next piece. */
export const AIM_LOOKBACK_MS = 150;
/** Holding the pointer on one piece this long selects it (or swaps with it), without a pinch. */
export const DWELL_MS = 1000;
/** A pinch reading below this counts as "trying to pinch" for the ?debug log. */
const DIP_START_RATIO = 0.8;
/** Two taps closer together than this are one gesture seen twice, so the second is ignored. */
export const TAP_DEBOUNCE_MS = 350;
/** A tap can't cancel a selection younger than this: the usual cause is the hover ring
 * selecting a piece just before the player's own pinch on the same piece lands. */
export const CANCEL_GUARD_MS = 1000;
/** How long a hand can vanish from tracking (a blink of the detector) and keep its piece. */
export const HAND_LOST_GRACE_MS = 300;
/** A hand further than this (share of canvas width) from every known hand is treated as new. */
const HAND_MATCH_RATIO = 0.3;
/** Drag id used by the mouse or a finger on the canvas, as opposed to hands "A" and "B". */
const POINTER_ID = "pointer";

interface TrackedHand {
  id: string;
  smoother: Smoother;
  /** Smoothed index fingertip in canvas pixels: the pointer. */
  point: Point;
  pinching: boolean;
  /** When the fingers started looking closed (not yet a pinch), or null. */
  closedSince: number | null;
  /** Stray "open" readings tolerated while the fingers are closing. */
  closedMisses: number;
  /** Smallest pinch reading since the fingers last started closing, for the ?debug log. */
  dipMin: number;
  /** When the fingers started looking open while still pinching, or null. */
  openSince: number | null;
  /** The piece under the pointer, kept until the pointer clearly leaves it. */
  hoverId: number | null;
  /** The piece that was under the pointer just before the fingers began to close. Closing the
   * fingers moves the fingertip, so this, not where it ends up, is what the player aimed at. */
  aimId: number | null;
  /** Recent hover targets, newest last, for AIM_LOOKBACK_MS. */
  hoverHistory: { at: number; id: number | null }[];
  /** The board cell the pointer is resting on for a hover-select, and since when. */
  dwellCell: number | null;
  dwellSince: number;
  /** A hover-select (or a pinch) already happened on this cell; move off it to arm again. */
  dwellSpent: boolean;
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
  /** For the ?debug overlay: camera detection rate and the latest gesture decisions. */
  debug: { detectionsPerSecond: number; log: string[] };
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
  /** How far a hover-select has filled, from 0 to 1. */
  dwell: number;
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
  let selectedAt = 0;
  let lastTapAt = -Infinity;
  // ?debug diagnostics: what the camera saw and what the game decided.
  const debugLog: string[] = [];
  const detectionTimes: number[] = [];

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

  /** The board cell (0-8) under a point, or null outside the board. */
  function cellIndexAt(board: Puzzle, point: Point): number | null {
    const col = Math.floor((point.x - board.box.x) / board.tileW);
    const row = Math.floor((point.y - board.box.y) / board.tileH);
    if (col < 0 || row < 0 || col > 2 || row > 2) return null;
    return row * 3 + col;
  }

  /** What the pointer was on about AIM_LOOKBACK_MS ago (or the oldest reading we have). */
  function hoverBefore(hand: TrackedHand, now: number): number | null {
    const target = now - AIM_LOOKBACK_MS;
    let pick: number | null = hand.hoverId;
    for (const entry of hand.hoverHistory) {
      if (entry.at > target) break;
      pick = entry.id;
    }
    // The pointer only just arrived on a piece: aim at where it is now, not at nothing.
    return pick ?? hand.hoverId;
  }

  /** Adds a line to the ?debug gesture log. */
  function note(now: number, text: string): void {
    debugLog.push(`${(now / 1000).toFixed(1)}s ${text}`);
    if (debugLog.length > 8) debugLog.shift();
  }

  /** One deliberate pinch on `target`: select it, cancel the selection, or swap with it. */
  function pinchTap(board: Puzzle, target: number | null, now: number, events: EngineEvent[]) {
    if (board.drag || board.solved) return;
    if (target === null) return note(now, "ignored: no piece under pointer");
    const piece = board.pieces[target];
    if (piece.placed) return note(now, "ignored: piece is locked");
    if (piece.displacing) return note(now, "ignored: piece still sliding");
    if (now - lastTapAt < TAP_DEBOUNCE_MS) return note(now, "ignored: too soon after last");
    if (selectedId === target && now - selectedAt < CANCEL_GUARD_MS) {
      return note(now, "ignored: just selected it");
    }
    lastTapAt = now;
    if (selectedId === null) {
      selectedId = target;
      selectedAt = now;
      note(now, `selected piece ${target + 1}`);
      events.push({ type: "pickup" });
      return;
    }
    if (selectedId === target) {
      selectedId = null;
      note(now, "cancelled selection");
      return;
    }
    const first = board.pieces[selectedId];
    note(now, `swapped ${selectedId + 1} and ${target + 1}`);
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
      // The pointer is the index fingertip: that's what people point with.
      const raw = toPixel(mirrorX(hand[LM.INDEX_TIP]), width, height);
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
          closedMisses: 0,
          dipMin: Infinity,
          openSince: null,
          hoverId: null,
          aimId: null,
          hoverHistory: [],
          dwellCell: null,
          dwellSince: now,
          dwellSpent: false,
          ratio,
          at: now,
        };
      }
      match.at = now;
      match.ratio = ratio;
      // ?debug: report a pinch attempt that never got close enough to count.
      if (ratio < DIP_START_RATIO) {
        match.dipMin = Math.min(match.dipMin, ratio);
      } else if (match.dipMin !== Infinity) {
        if (!match.pinching && match.closedSince === null) {
          note(now, `missed: closest ${match.dipMin.toFixed(2)}, needs < ${PINCH_CLOSE_RATIO}`);
        }
        match.dipMin = Infinity;
      }

      const wasPinching = match.pinching;
      if (isPinching(hand, match.pinching)) {
        match.openSince = null;
        match.closedMisses = 0;
        if (!match.pinching) {
          if (match.closedSince === null) {
            match.closedSince = now;
            match.aimId = hoverBefore(match, now);
          }
          if (now - match.closedSince >= GRAB_MS) {
            match.pinching = true;
            note(now, `pinch at ${match.dipMin.toFixed(2)}`);
          }
        }
      } else if (!match.pinching && match.closedSince !== null && match.closedMisses < 1) {
        // One shaky "open" reading in the middle of closing the fingers doesn't cancel the pinch.
        match.closedMisses += 1;
      } else {
        match.closedSince = null;
        match.closedMisses = 0;
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
      if (match.pinching && !wasPinching) {
        pinchTap(board, match.aimId, now, events);
        // Don't let the hover-select fire on the same cell right after a pinch.
        match.dwellSpent = true;
      }
      if (!match.pinching && match.closedSince === null) match.aimId = null;
      if (match.closedSince === null) match.hoverId = hoverAt(board, match.hoverId, match.point);
      match.hoverHistory.push({ at: now, id: match.hoverId });
      while (
        match.hoverHistory.length > 0 &&
        now - match.hoverHistory[0].at > AIM_LOOKBACK_MS * 3
      ) {
        match.hoverHistory.shift();
      }

      // Hover-select: resting the pointer on a piece fills a ring, then acts like a pinch. Keyed
      // to the board cell, so the piece that slides in after a swap doesn't start a new one.
      // The cell comes from the pointer, not the hover target: a piece sliding through mid-swap
      // has no hover target for a moment, and that must not re-arm the same cell.
      const cell = cellIndexAt(board, match.point);
      if (cell !== match.dwellCell) {
        match.dwellCell = cell;
        match.dwellSince = now;
        match.dwellSpent = false;
      }
      const resting = !match.pinching && match.closedSince === null;
      const ready = cell !== null && match.hoverId !== null && resting && !match.dwellSpent;
      if (ready && now - match.dwellSince >= DWELL_MS) {
        match.dwellSpent = true;
        pinchTap(board, match.hoverId, now, events);
      }
    }
    // Keep briefly lost hands, so a blink of the tracker doesn't reset their pinch state.
    const kept = unmatched.filter((t) => now - t.at < HAND_LOST_GRACE_MS);
    tracked = [...seen, ...kept];
    fingertips = seen.map((t) => t.point);
    cursors = seen.map((t) => {
      const holding = board.drag?.handId === t.id;
      const hoverPieceId = holding || board.drag || board.solved ? null : (t.aimId ?? t.hoverId);
      const dwell =
        t.dwellCell === null || t.dwellSpent || t.pinching || hoverPieceId === null
          ? 0
          : Math.min(1, (now - t.dwellSince) / DWELL_MS);
      return {
        point: t.point,
        pinching: t.pinching,
        holding,
        hoverPieceId,
        ratio: t.ratio,
        dwell,
      };
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
    if (frame.fresh !== false) {
      detectionTimes.push(now);
      while (detectionTimes.length > 0 && now - detectionTimes[0] > 1000) detectionTimes.shift();
    }
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
      debug: { detectionsPerSecond: detectionTimes.length, log: [...debugLog] },
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
