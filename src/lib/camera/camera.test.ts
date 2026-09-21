import { describe, expect, it } from "vitest";

import {
  COUNTDOWN_SECONDS,
  createEngine,
  FIST_HOLD_FRAMES,
  FREEZE_HOLD_MS,
} from "@/lib/camera/engine";
import type { EngineEvent } from "@/lib/camera/engine";
import { computeHandFrame, isFist, isPinching, LM, mirrorX } from "@/lib/camera/gestures";
import {
  createPuzzle,
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
    const rand = seeded(1);
    engine.update({ hands: pinchingHands(), now: 0, width, height }, rand);
    expect(engine.view().status).toBe("armed");
    engine.update({ hands: pinchingHands(), now: FREEZE_HOLD_MS + 50, width, height }, rand);
    expect(engine.view().phase).toBe("countdown");

    const ticks: number[] = [];
    let capture: EngineEvent | undefined;
    for (
      let t = FREEZE_HOLD_MS + 100;
      t < FREEZE_HOLD_MS + 50 + (COUNTDOWN_SECONDS + 1) * 1000;
      t += 100
    ) {
      const out = engine.update({ hands: [], now: t, width, height }, rand);
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
    const rand = seeded(1);
    engine.update({ hands: [makeHand({ pinch: true })], now: 0, width, height }, rand);
    expect(engine.view().armed).toBe(false);
    engine.update(
      {
        hands: [makeHand({ tip: { x: 0.7, y: 0.3 } }), makeHand({ tip: { x: 0.3, y: 0.7 } })],
        now: 50,
        width,
        height,
      },
      rand,
    );
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
        .update({ hands: [], now: t, width, height }, rand)
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
      engine.update({ hands: [], now: t, width, height }, rand);
    }
    expect(puzzle.solved).toBe(true);
    expect(seen).toContain("complete");
    expect(engine.stats().moves).toBeGreaterThanOrEqual(9);
    expect(engine.view().status).toBe("solved");

    let saved = false;
    for (let i = 0; i < FIST_HOLD_FRAMES + 2 && !saved; i++) {
      t += 33;
      saved = engine
        .update({ hands: [makeHand({ fist: true })], now: t, width, height }, rand)
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
    for (let i = 0; i < FIST_HOLD_FRAMES + 2 && !reset; i++) {
      reset = engine
        .update({ hands: [makeHand({ fist: true })], now: i * 33, width, height }, rand)
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
