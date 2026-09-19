import { getArt } from "@/lib/art";
import type { ArtId } from "@/lib/art";
import type { Memory } from "@/lib/memories";

export type Period = "all" | "today";
export type PlaceFilter = "all" | ArtId;

export const MAX_ROWS = 20;

/** The UTC calendar day of a timestamp, such as "2026-09-20". Daily boards reset at 00:00 UTC. */
export function utcDayKey(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function todayKey(): string {
  return utcDayKey(Date.now());
}

interface RankOptions {
  period: Period;
  place: PlaceFilter;
  /** The UTC day counted as "today". */
  today: string;
}

/** Best runs first; ties go to the faster solve, then the earlier run. */
export function rankRuns(memories: Memory[], { period, place, today }: RankOptions): Memory[] {
  return memories
    .filter((m) => (period === "all" ? true : utcDayKey(m.createdAt) === today))
    .filter((m) => (place === "all" ? true : getArt(m.artId).id === place))
    .sort((a, b) => b.score - a.score || a.seconds - b.seconds || a.createdAt - b.createdAt)
    .slice(0, MAX_ROWS);
}
