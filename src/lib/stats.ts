import { ART_LIST, isCameraId, normalizeArtId } from "@/lib/art";
import type { ArtId } from "@/lib/art";
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

/** Destinations with at least one solved puzzle: the stamps in your passport. */
export function visitedPlaces(memories: Memory[]): Set<ArtId> {
  return new Set(memories.filter((m) => !isCameraId(m.artId)).map((m) => normalizeArtId(m.artId)));
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
    name: "First stamp",
    hint: "Solve any puzzle",
    earned: (m) => m.length >= 1,
  },
  {
    id: "express",
    name: "Express rail",
    hint: "Solve one in 20 seconds or less",
    earned: (m) => m.some((x) => x.seconds <= 20),
  },
  {
    id: "light",
    name: "Packed light",
    hint: "Solve one in 12 moves or fewer",
    earned: (m) => m.some((x) => x.moves <= 12),
  },
  {
    id: "album",
    name: "Album full",
    hint: "Pin 5 polaroids",
    earned: (m) => m.length >= 5,
  },
  {
    id: "cheese",
    name: "Say cheese",
    hint: "Save a photo taken in camera mode",
    earned: (m) => m.some((x) => isCameraId(x.artId)),
  },
  {
    id: "tour",
    name: "Grand tour",
    hint: "Collect a stamp from every destination",
    earned: (m) => {
      const visited = visitedPlaces(m);
      return ART_LIST.every((art) => visited.has(art.id));
    },
  },
];

/** A stable tilt from -4 to +4 degrees for a memory id, so an album looks hand-placed but never jitters. */
export function tiltFor(id: string): number {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  return (hash % 9) - 4;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Short day-and-month for a postmark, such as "19 SEP". */
export function postmarkDate(timestamp: number): string {
  return new Date(timestamp)
    .toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    .toUpperCase();
}
