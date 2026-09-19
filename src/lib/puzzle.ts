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

/** Fewer moves and less time score higher; never drops below a small participation floor. */
export function scoreFor(moves: number, seconds: number): number {
  return Math.max(100, 2000 - moves * 40 - seconds * 8);
}

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
