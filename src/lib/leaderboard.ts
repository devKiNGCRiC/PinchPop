import { getArt } from "@/lib/art";
import type { PlaceId } from "@/lib/art";
import type { Memory } from "@/lib/memories";

export type Period = "all" | "today";
export type PlaceFilter = "all" | PlaceId;

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

/** Best runs first for the given filters; ties go to the faster solve, then the earlier run. */
export function rankAllRuns(memories: Memory[], { period, place, today }: RankOptions): Memory[] {
  return memories
    .filter((m) => (period === "all" ? true : utcDayKey(m.createdAt) === today))
    .filter((m) => (place === "all" ? true : getArt(m.artId).id === place))
    .sort((a, b) => b.score - a.score || a.seconds - b.seconds || a.createdAt - b.createdAt);
}

/** The same ranking, truncated to what the podium and table actually display. */
export function rankRuns(memories: Memory[], options: RankOptions): Memory[] {
  return rankAllRuns(memories, options).slice(0, MAX_ROWS);
}

export interface OwnRank {
  memory: Memory;
  /** 1-based position within every run matching the current filters. */
  rank: number;
  total: number;
  /** True once the rank is past what the podium and table actually show. */
  offScreen: boolean;
}

/**
 * Where the player's own most recent matching run stands, even once the board is long enough
 * that it has scrolled off the visible podium/table (LEAD-03's "off-screen rank" requirement,
 * scoped to one device's own runs since there is no shared leaderboard yet).
 */
export function ownRank(memories: Memory[], options: RankOptions): OwnRank | null {
  const ranked = rankAllRuns(memories, options);
  if (ranked.length === 0) return null;
  // `memories` is newest-first; the first entry that still matches the active filters is "yours".
  const latest = memories.find((m) => ranked.some((r) => r.id === m.id));
  if (!latest) return null;
  const rank = ranked.findIndex((r) => r.id === latest.id) + 1;
  return { memory: latest, rank, total: ranked.length, offScreen: rank > MAX_ROWS };
}
