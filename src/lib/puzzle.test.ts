import { describe, expect, it } from "vitest";

import {
  baseScore,
  formatAccuracy,
  formatTime,
  isSolved,
  placedCount,
  scoreFor,
  shuffledOrder,
  solvedOrder,
  swapTiles,
} from "@/lib/puzzle";

describe("Speed Run scoring", () => {
  it("starts at 2000 and pays 40 per move and 8 per second", () => {
    expect(baseScore(0, 0)).toBe(2000);
    expect(baseScore(7, 20)).toBe(1560);
  });

  it("never drops below the floor of 100", () => {
    expect(baseScore(200, 600)).toBe(100);
    expect(scoreFor(200, 600, 0)).toBe(50);
  });

  it("scales the base score by accuracy between 50% and 100%", () => {
    expect(scoreFor(7, 20, 1)).toBe(1560);
    expect(scoreFor(7, 20, 0.6)).toBe(1248);
    expect(scoreFor(7, 20, 0)).toBe(780);
  });

  it("treats a missing accuracy as perfect and clamps out-of-range values", () => {
    expect(scoreFor(7, 20)).toBe(1560);
    expect(scoreFor(7, 20, 5)).toBe(1560);
    expect(scoreFor(7, 20, -1)).toBe(780);
  });

  it("formats accuracy and time for display", () => {
    expect(formatAccuracy(0.876)).toBe("88%");
    expect(formatTime(75)).toBe("1:15");
  });
});

describe("swap puzzle helpers", () => {
  it("never deals a solved board and counts placed tiles", () => {
    for (let i = 0; i < 50; i++) {
      const order = shuffledOrder();
      expect(isSolved(order)).toBe(false);
      expect(placedCount(order)).toBeLessThan(9);
    }
    expect(placedCount(solvedOrder())).toBe(9);
  });

  it("swaps two tiles without mutating the original", () => {
    const order = solvedOrder();
    const next = swapTiles(order, 0, 8);
    expect(next[0]).toBe(8);
    expect(next[8]).toBe(0);
    expect(order[0]).toBe(0);
  });
});
