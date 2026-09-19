import { ART_LIST } from "@/lib/art";
import type { Memory } from "@/lib/memories";

export interface Stats {
  solved: number;
  bestSeconds: number | null;
  fewestMoves: number | null;
  totalScore: number;
}

export function computeStats(memories: Memory[]): Stats {
  return {
    solved: memories.length,
    bestSeconds: memories.length ? Math.min(...memories.map((m) => m.seconds)) : null,
    fewestMoves: memories.length ? Math.min(...memories.map((m) => m.moves)) : null,
    totalScore: memories.reduce((sum, m) => sum + m.score, 0),
  };
}

export interface BadgeDef {
  id: string;
  name: string;
  hint: string;
  earned: (memories: Memory[]) => boolean;
}

export const BADGES: BadgeDef[] = [
  {
    id: "first",
    name: "First flip",
    hint: "Solve any puzzle",
    earned: (m) => m.length >= 1,
  },
  {
    id: "speedy",
    name: "Speed demon",
    hint: "Solve one in 20 seconds or less",
    earned: (m) => m.some((x) => x.seconds <= 20),
  },
  {
    id: "tidy",
    name: "Tidy hands",
    hint: "Solve one in 12 moves or fewer",
    earned: (m) => m.some((x) => x.moves <= 12),
  },
  {
    id: "collector",
    name: "Collector",
    hint: "Save 5 polaroids",
    earned: (m) => m.length >= 5,
  },
  {
    id: "critic",
    name: "Art critic",
    hint: "Solve every picture at least once",
    earned: (m) => ART_LIST.every((art) => m.some((x) => x.artId === art.id)),
  },
];

/** A stable tilt from -4 to +4 degrees for a memory id, so a wall looks hand-placed but never jitters. */
export function tiltFor(id: string): number {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  return (hash % 9) - 4;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
