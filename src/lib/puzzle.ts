export const GRID = 3;
export const TILE_COUNT = GRID * GRID;

/** A tile's number is where it belongs; its position in the array is where it currently sits. */
export function solvedOrder(): number[] {
  return Array.from({ length: TILE_COUNT }, (_, i) => i);
}

export function isSolved(order: number[]): boolean {
  return order.every((tile, position) => tile === position);
}

/** Fisher–Yates shuffle that never returns an already-solved board. Swap puzzles are always solvable. */
export function shuffledOrder(): number[] {
  const order = solvedOrder();
  do {
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  } while (isSolved(order));
  return order;
}

export function swapTiles(order: number[], a: number, b: number): number[] {
  const next = [...order];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

/** Tiles already sitting in their final position, used for the live "x / 9 placed" count. */
export function placedCount(order: number[]): number {
  return order.filter((tile, position) => tile === position).length;
}

// Speed Run scoring: one fixed formula for every run, documented on the How to play page.
export const SCORE_START = 2000;
export const MOVE_COST = 40;
export const SECOND_COST = 8;
export const SCORE_FLOOR = 100;

/** Points left after paying for moves and time, before accuracy is applied. */
export function baseScore(moves: number, seconds: number): number {
  return Math.max(SCORE_FLOOR, SCORE_START - moves * MOVE_COST - seconds * SECOND_COST);
}

/**
 * The Speed Run score. Fewer moves and less time score higher; accuracy (the share of moves that
 * put a piece in its right place) scales it between 50% and 100% of the base score.
 */
export function scoreFor(moves: number, seconds: number, accuracy = 1): number {
  const clamped = Math.min(1, Math.max(0, accuracy));
  return Math.round(baseScore(moves, seconds) * (0.5 + 0.5 * clamped));
}

export function formatAccuracy(accuracy: number): string {
  return `${Math.round(Math.min(1, Math.max(0, accuracy)) * 100)}%`;
}

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
