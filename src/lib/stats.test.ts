import { describe, expect, it } from "vitest";

import type { Memory } from "@/lib/memories";
import { BADGES } from "@/lib/stats";

function run(artId: string, moves: number, seconds: number, id = `${artId}-${moves}`): Memory {
  return { id, artId, moves, seconds, score: 1000, createdAt: 0 };
}

function progressOf(badgeId: string, memories: Memory[]) {
  const badge = BADGES.find((b) => b.id === badgeId);
  if (!badge?.progress) throw new Error(`no progress for ${badgeId}`);
  return badge.progress(memories);
}

describe("milestone progress", () => {
  it("counts polaroids toward Album full and never goes past 5", () => {
    expect(progressOf("album", [run("taj", 10, 30), run("kerala", 9, 40)])).toEqual({
      label: "2 of 5 polaroids",
      fraction: 0.4,
    });
    const seven = Array.from({ length: 7 }, (_, i) => run("taj", 10, 30, `r${i}`));
    expect(progressOf("album", seven)).toEqual({ label: "5 of 5 polaroids", fraction: 1 });
  });

  it("counts each destination once for Grand tour and ignores camera runs", () => {
    const memories = [run("taj", 10, 30, "a"), run("taj", 8, 25, "b"), run("camera", 12, 50)];
    expect(progressOf("tour", memories)).toEqual({ label: "1 of 4 destinations", fraction: 0.25 });
  });

  it("shows the best time and fewest moves so far", () => {
    const memories = [run("taj", 14, 42), run("kerala", 20, 70)];
    expect(progressOf("express", memories)).toEqual({ label: "Your best: 0:42" });
    expect(progressOf("light", memories)).toEqual({ label: "Your best: 14 moves" });
  });

  it("shows nothing for best-so-far milestones before any run", () => {
    expect(progressOf("express", [])).toBeNull();
    expect(progressOf("light", [])).toBeNull();
  });
});
