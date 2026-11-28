import { describe, expect, it } from "vitest";

import {
  COUNTDOWN_SECONDS,
  createEngine,
  FIST_HOLD_MS,
  CANCEL_GUARD_MS,
  DWELL_MS,
  FREEZE_HOLD_MS,
  GRAB_MS,
} from "@/lib/camera/engine";
import type { EngineEvent } from "@/lib/camera/engine";
import { computeHandFrame, isFist, isPinching, LM, mirrorX } from "@/lib/camera/gestures";
import {
  cellOf,
  createPuzzle,
  findNearestPiece,
  handleDrag,
  isNearOwnCell,
  reconcile,
  stepTweens,
} from "@/lib/camera/pieces";
import type { Hand, Point } from "@/lib/camera/types";

// A small deterministic random generator so puzzle shuffles are repeatable.
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface HandOptions {
  tip?: Point;
  pinch?: boolean;
  fist?: boolean;
}

/** A synthetic 21-landmark hand: open by default, optionally pinching or curled into a fist. */
function makeHand({
  tip = { x: 0.5, y: 0.4 },
  pinch = false,
  fist = false,
}: HandOptions = {}): Hand {
  const hand: Hand = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.5 }));
  hand[LM.WRIST] = { x: 0.5, y: 0.9 };
  for (const mcp of [LM.INDEX_MCP, LM.MIDDLE_MCP, LM.RING_MCP, LM.PINKY_MCP]) {
    hand[mcp] = { x: 0.5, y: 0.7 };
  }
  const tipY = fist ? 0.78 : 0.3;
  for (const finger of [LM.MIDDLE_TIP, LM.RING_TIP, LM.PINKY_TIP]) {
    hand[finger] = { x: 0.5, y: tipY };
  }
  hand[LM.INDEX_TIP] = fist ? { x: 0.5, y: 0.78 } : tip;
  hand[LM.THUMB_TIP] = pinch ? { x: tip.x + 0.01, y: tip.y } : { x: tip.x + 0.2, y: tip.y };
  return hand;
}

describe("gestures", () => {
  it("detects a pinch only when thumb and index tips nearly touch", () => {
    expect(isPinching(makeHand({ pinch: true }))).toBe(true);
    expect(isPinching(makeHand({ pinch: false }))).toBe(false);
  });

  it("detects a closed fist but not an open hand", () => {
    expect(isFist(makeHand({ fist: true }))).toBe(true);
    expect(isFist(makeHand())).toBe(false);
  });

  it("mirrors landmarks horizontally to match the mirrored preview", () => {
    expect(mirrorX({ x: 0.2, y: 0.4 })).toEqual({ x: 0.8, y: 0.4 });
  });

  it("frames the shot between two fingertips, padded and clamped to the canvas", () => {
    const box = computeHandFrame({ x: 0.3, y: 0.3 }, { x: 0.7, y: 0.7 }, 1000, 600);
    expect(box.x).toBeCloseTo(272);
    expect(box.y).toBeCloseTo(152);
    expect(box.width).toBeCloseTo(456);
    expect(box.height).toBeCloseTo(296);
    const clamped = computeHandFrame({ x: 0, y: 0 }, { x: 1, y: 1 }, 1000, 600);
    expect(clamped).toEqual({ x: 0, y: 0, width: 1000, height: 600 });
  });
});

describe("puzzle pieces", () => {
  const box = { x: 100, y: 60, width: 300, height: 240 };

  it("deals nine pieces and never an already-solved board", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const puzzle = createPuzzle(box, seeded(seed));
      expect(puzzle.pieces).toHaveLength(9);
      expect(puzzle.solved).toBe(false);
    }
  });

  it("snaps a dropped piece home and completes when every piece is placed", () => {
    const rand = seeded(7);
    const puzzle = createPuzzle(box, rand);
    let completed = false;
    for (let guard = 0; guard < 40 && !puzzle.solved; guard++) {
      const piece = puzzle.pieces.find((p) => !p.placed);
      if (!piece) break;
      const from = { x: piece.x + piece.w / 2, y: piece.y + piece.h / 2 };
      handleDrag(puzzle, "hand", true, from, guard, rand);
      const to = {
        x: box.x + piece.col * puzzle.tileW + piece.w / 2,
        y: box.y + piece.row * puzzle.tileH + piece.h / 2,
      };
      handleDrag(puzzle, "hand", true, to, guard, rand);
      const now = guard * 1000;
      const events = handleDrag(puzzle, "hand", false, to, now, rand);
      if (events.includes("complete")) completed = true;
      // Let any bumped piece finish sliding, then re-check the board.
      stepTweens(puzzle, now + 500);
      if (reconcile(puzzle) && !completed && puzzle.solved) completed = true;
    }
    expect(puzzle.solved).toBe(true);
    expect(completed).toBe(true);
    expect(puzzle.pieces.every((p) => isNearOwnCell(puzzle, p))).toBe(true);
    expect(reconcile(puzzle)).toBe(true);
    // A solved board is aligned exactly to the grid.
    for (const piece of puzzle.pieces) {
      expect(piece.x).toBe(box.x + piece.col * puzzle.tileW);
      expect(piece.y).toBe(box.y + piece.row * puzzle.tileH);
    }
  });

  it("ignores a second pointer while one already holds a piece", () => {
    const rand = seeded(3);
    const puzzle = createPuzzle(box, rand);
    const piece = puzzle.pieces[0];
    handleDrag(puzzle, "A", true, { x: piece.x + 5, y: piece.y + 5 }, 0, rand);
    expect(puzzle.drag?.handId).toBe("A");
    handleDrag(puzzle, "B", true, { x: 10, y: 10 }, 1, rand);
    expect(puzzle.drag?.handId).toBe("A");
  });
});

describe("camera engine", () => {
  const width = 1000;
  const height = 600;
  const pinchingHands = () => [
    makeHand({ tip: { x: 0.7, y: 0.3 }, pinch: true }),
    makeHand({ tip: { x: 0.3, y: 0.7 }, pinch: true }),
  ];

  function events(list: EngineEvent[], type: EngineEvent["type"]) {
    return list.filter((e) => e.type === type);
  }

  it("arms the shutter on a held two-hand pinch, counts down, then asks for a capture", () => {
    const engine = createEngine();
    engine.update({ hands: pinchingHands(), now: 0, width, height });
    expect(engine.view().status).toBe("armed");
    engine.update({ hands: pinchingHands(), now: FREEZE_HOLD_MS + 50, width, height });
    expect(engine.view().phase).toBe("countdown");

    const ticks: number[] = [];
    let capture: EngineEvent | undefined;
    for (
      let t = FREEZE_HOLD_MS + 100;
      t < FREEZE_HOLD_MS + 50 + (COUNTDOWN_SECONDS + 1) * 1000;
      t += 100
    ) {
      const out = engine.update({ hands: [], now: t, width, height });
      for (const e of events(out, "countdown")) if (e.type === "countdown") ticks.push(e.n);
      capture ??= events(out, "capture")[0];
    }
    expect(ticks).toEqual([3, 2, 1]);
    expect(capture?.type).toBe("capture");
    if (capture?.type === "capture") {
      expect(capture.box.x).toBeCloseTo(272);
      expect(capture.box.width).toBeCloseTo(456);
      expect(capture.box.height).toBeCloseTo(296);
    }
  });

  it("does not arm with one hand, or with two open hands", () => {
    const engine = createEngine();
    engine.update({ hands: [makeHand({ pinch: true })], now: 0, width, height });
    expect(engine.view().armed).toBe(false);
    engine.update({
      hands: [makeHand({ tip: { x: 0.7, y: 0.3 } }), makeHand({ tip: { x: 0.3, y: 0.7 } })],
      now: 50,
      width,
      height,
    });
    expect(engine.view().armed).toBe(false);
    expect(engine.view().frameBox).not.toBeNull();
  });

  it("supports a manual capture, mouse solving, and a fist to save", () => {
    const engine = createEngine();
    const rand = seeded(11);
    const box = { x: 200, y: 100, width: 450, height: 300 };
    expect(engine.requestCapture(box, 0)).toBe(true);
    expect(engine.requestCapture(box, 0)).toBe(false);

    let t = 0;
    let captured = false;
    while (!captured && t < 5000) {
      t += 100;
      captured = engine
        .update({ hands: [], now: t, width, height })
        .some((e) => e.type === "capture");
    }
    expect(captured).toBe(true);

    const puzzle = engine.beginPuzzle(box, t, rand);
    const seen: EngineEvent["type"][] = [];
    for (let guard = 0; guard < 40 && !puzzle.solved; guard++) {
      const piece = puzzle.pieces.find((p) => !p.placed);
      if (!piece) break;
      t += 50;
      const to = {
        x: box.x + piece.col * puzzle.tileW + piece.w / 2,
        y: box.y + piece.row * puzzle.tileH + piece.h / 2,
      };
      engine.pointer(true, { x: piece.x + piece.w / 2, y: piece.y + piece.h / 2 }, t, rand);
      engine.pointer(true, to, t, rand);
      for (const e of engine.pointer(false, to, t, rand)) seen.push(e.type);
      engine.update({ hands: [], now: t, width, height });
    }
    expect(puzzle.solved).toBe(true);
    expect(seen).toContain("complete");
    expect(engine.stats().moves).toBeGreaterThanOrEqual(9);
    expect(engine.view().status).toBe("solved");

    let saved = false;
    for (let i = 0; i < FIST_HOLD_MS / 33 + 3 && !saved; i++) {
      t += 33;
      saved = engine
        .update({ hands: [makeHand({ fist: true })], now: t, width, height })
        .some((e) => e.type === "save");
    }
    expect(saved).toBe(true);
    expect(engine.view().phase).toBe("saving");
  });

  it("resets to tracking when a fist is held before the puzzle is solved", () => {
    const engine = createEngine();
    const rand = seeded(5);
    const box = { x: 200, y: 100, width: 450, height: 300 };
    engine.beginPuzzle(box, 0, rand);
    let reset = false;
    for (let i = 0; i < FIST_HOLD_MS / 33 + 3 && !reset; i++) {
      reset = engine
        .update({ hands: [makeHand({ fist: true })], now: i * 33, width, height })
        .some((e) => e.type === "reset");
    }
    expect(reset).toBe(true);
    expect(engine.view().phase).toBe("tracking");
  });

  it("only accepts a save request once the puzzle is solved", () => {
    const engine = createEngine();
    const rand = seeded(2);
    engine.beginPuzzle({ x: 0, y: 0, width: 300, height: 300 }, 0, rand);
    expect(engine.requestSave()).toBe(false);
  });

  it("tracks accuracy: a drop that misses its cell counts as a move but not a clean one", () => {
    const engine = createEngine();
    const rand = seeded(9);
    const box = { x: 100, y: 60, width: 450, height: 300 };
    const puzzle = engine.beginPuzzle(box, 0, rand);
    expect(engine.stats().accuracy).toBe(1);

    const piece = puzzle.pieces.find((p) => !p.placed);
    if (!piece) throw new Error("expected an unplaced piece");
    // Drop it on a cell that is not its own: same row, next column over.
    const wrongCol = (piece.col + 1) % 3;
    const to = {
      x: box.x + wrongCol * puzzle.tileW + piece.w / 2,
      y: box.y + piece.row * puzzle.tileH + piece.h / 2,
    };
    engine.pointer(true, { x: piece.x + piece.w / 2, y: piece.y + piece.h / 2 }, 10, rand);
    engine.pointer(true, to, 20, rand);
    engine.pointer(false, to, 30, rand);

    const stats = engine.stats();
    expect(stats.moves).toBe(1);
    expect(stats.accuracy).toBe(0);
  });
});

describe("steady hand control", () => {
  const width = 1000;
  const height = 600;
  const box = { x: 200, y: 100, width: 450, height: 300 };

  /** A hand whose index fingertip (the pointer) lands on canvas pixel `at`. */
  function handAt(at: Point, { pinch = true, gap }: { pinch?: boolean; gap?: number } = {}): Hand {
    // Canvas is mirrored, so canvas x maps back to 1 - x in camera space.
    const cx = 1 - at.x / width;
    const cy = at.y / height;
    const spread = gap ?? (pinch ? 0.01 : 0.2);
    const hand = makeHand({ tip: { x: cx, y: cy }, pinch: false });
    hand[LM.THUMB_TIP] = { x: cx + spread, y: cy };
    return hand;
  }

  function centre(p: { x: number; y: number; w: number; h: number }): Point {
    return { x: p.x + p.w / 2, y: p.y + p.h / 2 };
  }

  it("needs a wider opening to let go than to grab (hysteresis)", () => {
    // Hand size is 0.2 here; a 0.12 gap is a ratio of 0.6, between the two thresholds.
    const halfOpen = handAt({ x: 500, y: 300 }, { gap: 0.12 });
    expect(isPinching(halfOpen)).toBe(false);
    expect(isPinching(halfOpen, true)).toBe(true);
  });

  it("picks the piece under the pinch, not a neighbour whose centre is closer", () => {
    const puzzle = createPuzzle(box, seeded(4));
    const [a, b, ...rest] = puzzle.pieces;
    for (const p of rest) {
      p.x = 2000;
      p.y = 2000;
    }
    // Put two pieces side by side, then pinch just inside a's right edge.
    a.x = 300;
    a.y = 150;
    b.x = 300 + a.w;
    b.y = 150;
    const hit = findNearestPiece(puzzle, a.x + a.w - 3, a.y + a.h / 2);
    expect(hit?.id).toBe(a.id);
    // Far outside every piece grabs nothing.
    expect(findNearestPiece(puzzle, 5, 5)).toBeNull();
  });

  type Engine = ReturnType<typeof createEngine>;

  /** A deliberate pinch tap at `at`: fingers open long enough to re-arm (pointer settles there),
   * then closed long enough to count. Returns the time after the tap. */
  function tap(engine: Engine, at: Point, now: number, extra: Hand[] = []): number {
    for (let i = 0; i < 10; i++) {
      now += 33;
      engine.update({ hands: [handAt(at, { pinch: false }), ...extra], now, width, height });
    }
    for (let i = 0; i <= Math.ceil(GRAB_MS / 33); i++) {
      now += 33;
      engine.update({ hands: [handAt(at), ...extra], now, width, height });
    }
    return now;
  }

  function cellCentre(row: number, col: number, puzzle: ReturnType<typeof createPuzzle>): Point {
    return {
      x: box.x + col * puzzle.tileW + puzzle.tileW / 2,
      y: box.y + row * puzzle.tileH + puzzle.tileH / 2,
    };
  }

  /** Two unplaced pieces of a fresh puzzle. */
  function twoLoosePieces(puzzle: ReturnType<typeof createPuzzle>) {
    const loose = puzzle.pieces.filter((p) => !p.placed);
    return [loose[0], loose[1]] as const;
  }

  it("swaps two pieces with one pinch on each", () => {
    const engine = createEngine();
    const rand = seeded(6);
    const puzzle = engine.beginPuzzle(box, 0, rand);
    const [a, b] = twoLoosePieces(puzzle);
    const cellA = cellOf(puzzle, a);
    const cellB = cellOf(puzzle, b);

    let now = tap(engine, centre(a), 0);
    expect(engine.view().selectedPieceId).toBe(a.id);
    now = tap(engine, centre(b), now);
    expect(engine.view().selectedPieceId).toBeNull();
    engine.update({ hands: [], now: now + 500, width, height });
    expect(cellOf(puzzle, a)).toEqual(cellB);
    expect(cellOf(puzzle, b)).toEqual(cellA);
    expect(engine.stats().moves).toBe(1);
  });

  it("cancels a selection by pinching the same piece again", () => {
    const engine = createEngine();
    const puzzle = engine.beginPuzzle(box, 0, seeded(8));
    const [a] = twoLoosePieces(puzzle);
    const now = tap(engine, centre(a), 0);
    expect(engine.view().selectedPieceId).toBe(a.id);
    // Too soon after selecting: treated as the same gesture, not a cancel.
    tap(engine, centre(a), now);
    expect(engine.view().selectedPieceId).toBe(a.id);
    // A deliberate second pinch a moment later cancels.
    tap(engine, centre(a), now + CANCEL_GUARD_MS);
    expect(engine.view().selectedPieceId).toBeNull();
    expect(engine.stats().moves).toBe(0);
  });

  it("keeps working when the detector swaps the order of two hands", () => {
    const engine = createEngine();
    const puzzle = engine.beginPuzzle(box, 0, seeded(10));
    const [a] = twoLoosePieces(puzzle);
    const idle = () => handAt({ x: 60, y: 560 }, { pinch: false });
    let now = 0;
    for (let i = 0; i < 12; i++) {
      const hands = [handAt(centre(a), { pinch: false }), idle()];
      if (i % 2) hands.reverse();
      engine.update({ hands, now: (now += 33), width, height });
    }
    for (let i = 0; i <= Math.ceil(GRAB_MS / 33); i++) {
      const hands = [handAt(centre(a)), idle()];
      if (i % 2) hands.reverse();
      engine.update({ hands, now: (now += 33), width, height });
    }
    expect(engine.view().selectedPieceId).toBe(a.id);
  });

  it("never selects a piece by moving an already-pinched hand over it", () => {
    const engine = createEngine();
    const puzzle = engine.beginPuzzle(box, 0, seeded(12));
    // Pinch on empty space outside the board, then sweep across every piece while still pinched.
    let now = tap(engine, { x: 900, y: 550 }, 0);
    for (const piece of puzzle.pieces) {
      for (let i = 0; i < 3; i++) {
        engine.update({ hands: [handAt(centre(piece))], now: (now += 33), width, height });
      }
    }
    expect(engine.view().selectedPieceId).toBeNull();
    expect(engine.stats().moves).toBe(0);
  });

  it("does not turn a flicker of open fingers into a second pinch", () => {
    const engine = createEngine();
    const puzzle = engine.beginPuzzle(box, 0, seeded(14));
    const [a] = twoLoosePieces(puzzle);
    let now = tap(engine, centre(a), 0);
    expect(engine.view().selectedPieceId).toBe(a.id);
    // One open reading, repeated by many screen redraws, then pinched again.
    engine.update({
      hands: [handAt(centre(a), { pinch: false })],
      now: (now += 33),
      width,
      height,
    });
    for (let i = 0; i < 20; i++) {
      engine.update({
        hands: [handAt(centre(a), { pinch: false })],
        now: (now += 8),
        width,
        height,
        fresh: false,
      });
    }
    engine.update({ hands: [handAt(centre(a))], now: now + 33, width, height });
    // Still selected: that was the same pinch, not a second one that would cancel it.
    expect(engine.view().selectedPieceId).toBe(a.id);
  });

  it("selects the piece aimed at when the fingers began to close, even if the pinch drifts", () => {
    const engine = createEngine();
    const puzzle = engine.beginPuzzle(box, 0, seeded(18));
    const [a, b, ...rest] = puzzle.pieces;
    for (const p of rest) {
      p.x = 2000;
      p.y = 2000;
    }
    a.x = 300;
    a.y = 150;
    b.x = 300 + a.w;
    b.y = 150;
    a.placed = false;
    b.placed = false;
    // Closing the fingers drags the tip a few pixels across the shared edge.
    const onA = { x: a.x + a.w - 8, y: a.y + a.h / 2 };
    const onB = { x: b.x + 8, y: b.y + b.h / 2 };
    let now = 0;
    for (let i = 0; i < 6; i++) {
      engine.update({ hands: [handAt(onA, { pinch: false })], now: (now += 33), width, height });
    }
    expect(engine.view().cursors[0].hoverPieceId).toBe(a.id);
    // Fingers close while the pinch point slides over onto b.
    for (let i = 0; i <= Math.ceil(GRAB_MS / 33); i++) {
      engine.update({ hands: [handAt(i === 0 ? onA : onB)], now: (now += 33), width, height });
    }
    expect(engine.view().selectedPieceId).toBe(a.id);
  });

  it("locks pieces already in their right spot", () => {
    const engine = createEngine();
    const puzzle = engine.beginPuzzle(box, 0, seeded(20));
    const [a] = twoLoosePieces(puzzle);
    const home = cellCentre(a.row, a.col, puzzle);
    // Put a straight into its home cell by swapping with whatever sits there.
    const occupant = puzzle.pieces.find(
      (p) => p !== a && cellOf(puzzle, p).row === a.row && cellOf(puzzle, p).col === a.col,
    );
    if (!occupant) throw new Error("expected a piece in a's home cell");
    let now = tap(engine, centre(a), 0);
    now = tap(engine, centre(occupant), now);
    engine.update({ hands: [], now: (now += 500), width, height });
    expect(a.placed).toBe(true);
    // Pinching the placed piece does nothing.
    tap(engine, home, now);
    expect(engine.view().selectedPieceId).toBeNull();
    expect(engine.view().cursors[0].hoverPieceId).toBeNull();
  });

  it("solves a whole puzzle with pinch swaps", () => {
    const engine = createEngine();
    const puzzle = engine.beginPuzzle(box, 0, seeded(22));
    let now = 0;
    let completed = false;
    for (let guard = 0; guard < 12 && !puzzle.solved; guard++) {
      const piece = puzzle.pieces.find((p) => !p.placed);
      if (!piece) break;
      const occupant = puzzle.pieces.find(
        (p) =>
          p !== piece && cellOf(puzzle, p).row === piece.row && cellOf(puzzle, p).col === piece.col,
      );
      if (!occupant) throw new Error("expected an occupant");
      now = tap(engine, centre(piece), now);
      const before = engine.stats().moves;
      const out: string[] = [];
      for (let i = 0; i < 10; i++) {
        const events = engine.update({
          hands: [handAt(centre(occupant), { pinch: false })],
          now: (now += 33),
          width,
          height,
        });
        out.push(...events.map((e) => e.type));
      }
      for (let i = 0; i <= Math.ceil(GRAB_MS / 33); i++) {
        const events = engine.update({
          hands: [handAt(centre(occupant))],
          now: (now += 33),
          width,
          height,
        });
        out.push(...events.map((e) => e.type));
      }
      if (out.includes("complete")) completed = true;
      expect(engine.stats().moves).toBe(before + 1);
      engine.update({ hands: [], now: (now += 500), width, height });
    }
    expect(puzzle.solved).toBe(true);
    expect(completed).toBe(true);
    expect(engine.stats().accuracy).toBe(1);
  });

  it("shows which piece an open hand would pick", () => {
    const engine = createEngine();
    const puzzle = engine.beginPuzzle(box, 0, seeded(24));
    const [a] = twoLoosePieces(puzzle);
    for (let i = 0; i < 8; i++) {
      engine.update({ hands: [handAt(centre(a), { pinch: false })], now: i * 33, width, height });
    }
    const [cursor] = engine.view().cursors;
    expect(cursor.hoverPieceId).toBe(a.id);
    expect(cursor.pinching).toBe(false);
  });

  it("selects a piece by resting the pointer on it, then swaps the same way", () => {
    const engine = createEngine();
    const puzzle = engine.beginPuzzle(box, 0, seeded(26));
    const [a, b] = twoLoosePieces(puzzle);
    const cellB = cellOf(puzzle, b);
    let now = 0;
    const rest = (at: Point, ms: number) => {
      for (let t = 0; t < ms; t += 33) {
        engine.update({ hands: [handAt(at, { pinch: false })], now: (now += 33), width, height });
      }
    };
    rest(centre(a), DWELL_MS / 2);
    expect(engine.view().selectedPieceId).toBeNull();
    expect(engine.view().cursors[0].dwell).toBeGreaterThan(0.3);
    rest(centre(a), DWELL_MS / 2 + 100);
    expect(engine.view().selectedPieceId).toBe(a.id);
    // Staying put doesn't fire again (that would cancel the selection).
    rest(centre(a), DWELL_MS * 2);
    expect(engine.view().selectedPieceId).toBe(a.id);
    // Rest on b: they swap.
    const atB = centre(b);
    rest(atB, DWELL_MS + 500);
    expect(cellOf(puzzle, a)).toEqual(cellB);
    expect(engine.stats().moves).toBe(1);
    // The piece that slid into that cell is not picked up just because the pointer is still there.
    rest(atB, DWELL_MS * 2);
    expect(engine.view().selectedPieceId).toBeNull();
  });

  it("does not hover-select a piece right after pinching it", () => {
    const engine = createEngine();
    const puzzle = engine.beginPuzzle(box, 0, seeded(28));
    const [a] = twoLoosePieces(puzzle);
    let now = tap(engine, centre(a), 0);
    expect(engine.view().selectedPieceId).toBe(a.id);
    for (let t = 0; t < DWELL_MS * 2; t += 33) {
      engine.update({
        hands: [handAt(centre(a), { pinch: false })],
        now: (now += 33),
        width,
        height,
      });
    }
    expect(engine.view().selectedPieceId).toBe(a.id);
  });

  it("does not cancel when a pinch lands right after the hover ring selected the piece", () => {
    const engine = createEngine();
    const puzzle = engine.beginPuzzle(box, 0, seeded(30));
    const [a] = twoLoosePieces(puzzle);
    let now = 0;
    // Rest until the ring selects it...
    while (engine.view().selectedPieceId === null && now < DWELL_MS * 2) {
      engine.update({
        hands: [handAt(centre(a), { pinch: false })],
        now: (now += 33),
        width,
        height,
      });
    }
    expect(engine.view().selectedPieceId).toBe(a.id);
    // ...then the player's own pinch arrives a moment later.
    for (let i = 0; i < 4; i++) {
      engine.update({ hands: [handAt(centre(a))], now: (now += 33), width, height });
    }
    expect(engine.view().selectedPieceId).toBe(a.id);
  });

  it("still counts a pinch when one reading in the middle looks open", () => {
    const engine = createEngine();
    const puzzle = engine.beginPuzzle(box, 0, seeded(32));
    const [a] = twoLoosePieces(puzzle);
    const at = centre(a);
    let now = 0;
    for (let i = 0; i < 6; i++) {
      engine.update({ hands: [handAt(at, { pinch: false })], now: (now += 33), width, height });
    }
    engine.update({ hands: [handAt(at)], now: (now += 33), width, height });
    engine.update({ hands: [handAt(at, { pinch: false })], now: (now += 33), width, height });
    engine.update({ hands: [handAt(at)], now: now + 33, width, height });
    expect(engine.view().selectedPieceId).toBe(a.id);
  });

  it("trusts the flat reading when the 3D depth guess says the fingers are apart", () => {
    const hand = handAt({ x: 500, y: 300 });
    // 3D landmarks with the thumb 'behind' the index finger by a wrong depth guess.
    hand.world = hand.map((p, i) => ({
      x: p.x * 0.4,
      y: p.y * 0.4,
      z: i === LM.THUMB_TIP ? 0.06 : 0,
    }));
    expect(isPinching(hand)).toBe(true);
  });

  it("selects when the pointer arrives and pinches straight away", () => {
    const engine = createEngine();
    const puzzle = engine.beginPuzzle(box, 0, seeded(34));
    const [a] = twoLoosePieces(puzzle);
    const at = centre(a);
    // One reading off the board, one on the piece, then pinched.
    engine.update({
      hands: [handAt({ x: 950, y: 560 }, { pinch: false })],
      now: 33,
      width,
      height,
    });
    engine.update({ hands: [handAt(at, { pinch: false })], now: 66, width, height });
    engine.update({ hands: [handAt(at)], now: 99, width, height });
    engine.update({ hands: [handAt(at)], now: 132, width, height });
    expect(engine.view().selectedPieceId).toBe(a.id);
  });

  it("counts a quick pinch seen in only one camera reading", () => {
    const engine = createEngine();
    const puzzle = engine.beginPuzzle(box, 0, seeded(36));
    const [a] = twoLoosePieces(puzzle);
    const at = centre(a);
    let now = 0;
    for (let i = 0; i < 6; i++) {
      engine.update({ hands: [handAt(at, { pinch: false })], now: (now += 33), width, height });
    }
    engine.update({ hands: [handAt(at)], now: (now += 33), width, height });
    engine.update({ hands: [handAt(at, { pinch: false })], now: now + 33, width, height });
    expect(engine.view().selectedPieceId).toBe(a.id);
  });

  /** A fist whose thumb rests on the index finger: it also reads as a tight pinch. */
  function fistAt(at: Point): Hand {
    const hand = makeHand({ fist: true });
    const cx = 1 - at.x / width;
    const cy = at.y / height;
    hand[LM.INDEX_TIP] = { x: cx, y: Math.max(cy, 0.78) };
    hand[LM.THUMB_TIP] = { x: cx + 0.005, y: Math.max(cy, 0.78) };
    return hand;
  }

  it("never treats a fist as a pinch", () => {
    const engine = createEngine();
    const puzzle = engine.beginPuzzle(box, 0, seeded(38));
    const [a] = twoLoosePieces(puzzle);
    let now = 0;
    for (let i = 0; i < 6; i++) {
      engine.update({
        hands: [handAt(centre(a), { pinch: false })],
        now: (now += 33),
        width,
        height,
      });
    }
    for (let i = 0; i < 5; i++) {
      engine.update({ hands: [fistAt(centre(a))], now: (now += 33), width, height });
    }
    expect(engine.view().selectedPieceId).toBeNull();
    expect(engine.view().fistProgress).toBeGreaterThan(0);
  });

  it("saves with a fist even when its thumb touches the index and the tracker blinks", () => {
    const engine = createEngine();
    const puzzle = engine.beginPuzzle(box, 0, seeded(40));
    for (const piece of puzzle.pieces) {
      piece.x = box.x + piece.col * puzzle.tileW;
      piece.y = box.y + piece.row * puzzle.tileH;
    }
    reconcile(puzzle);
    expect(puzzle.solved).toBe(true);
    let now = 0;
    let saved = false;
    for (let i = 0; i < 40 && !saved; i++) {
      // Every fifth reading the tracker loses the hand for a moment.
      const hands = i % 5 === 4 ? [] : [fistAt({ x: 500, y: 300 })];
      saved = engine
        .update({ hands, now: (now += 33), width, height })
        .some((e) => e.type === "save");
    }
    expect(saved).toBe(true);
    expect(now).toBeLessThan(FIST_HOLD_MS + 200);
  });

  it("holds the hover ring while the fingers are closing, so it never races a pinch", () => {
    const engine = createEngine();
    const puzzle = engine.beginPuzzle(box, 0, seeded(42));
    const [a] = twoLoosePieces(puzzle);
    // A ratio of 0.6: fingers coming together, not yet a pinch.
    for (let t = 0; t < DWELL_MS * 2; t += 33) {
      engine.update({ hands: [handAt(centre(a), { gap: 0.12 })], now: t, width, height });
    }
    expect(engine.view().selectedPieceId).toBeNull();
  });

  it("aims at the new piece when the hand moves there quickly and pinches straight away", () => {
    const engine = createEngine();
    const puzzle = engine.beginPuzzle(box, 0, seeded(44));
    const [a, b, ...rest] = puzzle.pieces;
    for (const p of rest) {
      p.x = 2000;
      p.y = 2000;
    }
    a.x = 300;
    a.y = 150;
    b.x = 300;
    b.y = 150 + a.h;
    a.placed = false;
    b.placed = false;
    let now = 0;
    for (let i = 0; i < 8; i++) {
      engine.update({
        hands: [handAt(centre(a), { pinch: false })],
        now: (now += 33),
        width,
        height,
      });
    }
    // One quick move down onto b, then an immediate pinch.
    engine.update({
      hands: [handAt(centre(b), { pinch: false })],
      now: (now += 33),
      width,
      height,
    });
    engine.update({ hands: [handAt(centre(b))], now: (now += 33), width, height });
    engine.update({ hands: [handAt(centre(b))], now: now + 33, width, height });
    expect(engine.view().selectedPieceId).toBe(b.id);
  });
});
