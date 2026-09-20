import type { Box, Point } from "@/lib/camera/types";

export const GRID = 3;
/** A dropped piece within this fraction of a tile from its own cell snaps into place. */
export const SNAP_DISTANCE_RATIO = 0.75;
export const DISPLACE_ANIM_MS = 220;

export type Rand = () => number;

interface Tween {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  start: number;
}

/** One ninth of the captured photo. `id` is also the index of its image in the renderer. */
export interface Piece {
  id: number;
  row: number;
  col: number;
  w: number;
  h: number;
  x: number;
  y: number;
  placed: boolean;
  dragging: boolean;
  displacing: boolean;
  tween: Tween | null;
}

interface DragState {
  handId: string;
  pieceId: number;
  offsetX: number;
  offsetY: number;
}

export interface Puzzle {
  box: Box;
  tileW: number;
  tileH: number;
  pieces: Piece[];
  solved: boolean;
  drag: DragState | null;
}

export type PuzzleEvent = "pickup" | "drop" | "snap" | "complete";

function shuffle<T>(items: T[], rand: Rand): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function correctPosition(puzzle: Puzzle, piece: Piece): Point {
  return {
    x: puzzle.box.x + piece.col * puzzle.tileW,
    y: puzzle.box.y + piece.row * puzzle.tileH,
  };
}

export function isNearOwnCell(puzzle: Puzzle, piece: Piece): boolean {
  const target = correctPosition(puzzle, piece);
  const tolerance = Math.min(puzzle.tileW, puzzle.tileH) * SNAP_DISTANCE_RATIO;
  return Math.hypot(piece.x - target.x, piece.y - target.y) < tolerance;
}

export function placedCount(puzzle: Puzzle): number {
  return puzzle.pieces.filter((p) => p.placed).length;
}

/** Re-derives every settled piece's `placed` flag and returns whether the whole puzzle is solved. */
export function reconcile(puzzle: Puzzle): boolean {
  for (const piece of puzzle.pieces) {
    if (piece.displacing || piece.dragging) continue;
    piece.placed = isNearOwnCell(puzzle, piece);
  }
  puzzle.solved = puzzle.pieces.every((p) => p.placed);
  if (puzzle.solved) {
    // A finished board sits exactly on the grid, so the final photo has no visible seams.
    for (const piece of puzzle.pieces) {
      const home = correctPosition(puzzle, piece);
      piece.x = home.x;
      piece.y = home.y;
    }
  }
  return puzzle.solved;
}

/** Cuts the frame into a 3×3 board and scatters the pieces across shuffled cells. */
export function createPuzzle(box: Box, rand: Rand): Puzzle {
  const tileW = Math.floor(box.width / GRID);
  const tileH = Math.floor(box.height / GRID);
  const puzzle: Puzzle = { box: { ...box }, tileW, tileH, pieces: [], solved: false, drag: null };

  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      puzzle.pieces.push({
        id: row * GRID + col,
        row,
        col,
        w: col === GRID - 1 ? box.width - col * tileW : tileW,
        h: row === GRID - 1 ? box.height - row * tileH : tileH,
        x: 0,
        y: 0,
        placed: false,
        dragging: false,
        displacing: false,
        tween: null,
      });
    }
  }

  const cells: Point[] = puzzle.pieces.map((p) => correctPosition(puzzle, p));
  // Never deal a board that is already solved.
  do {
    const slots = shuffle([...cells], rand);
    puzzle.pieces.forEach((piece, i) => {
      piece.x = slots[i].x;
      piece.y = slots[i].y;
    });
  } while (puzzle.pieces.every((p) => isNearOwnCell(puzzle, p)));

  reconcile(puzzle);
  return puzzle;
}

function clampToBoard(puzzle: Puzzle, piece: Piece): void {
  const { box } = puzzle;
  piece.x = Math.min(Math.max(piece.x, box.x), box.x + box.width - piece.w);
  piece.y = Math.min(Math.max(piece.y, box.y), box.y + box.height - piece.h);
}

function centreInCell(puzzle: Puzzle, piece: Piece, row: number, col: number): boolean {
  const cellX = puzzle.box.x + col * puzzle.tileW;
  const cellY = puzzle.box.y + row * puzzle.tileH;
  const cx = piece.x + piece.w / 2;
  const cy = piece.y + piece.h / 2;
  return cx >= cellX && cx < cellX + puzzle.tileW && cy >= cellY && cy < cellY + puzzle.tileH;
}

/** If another piece already sits in the target cell, slide it to a random free cell. */
function displaceOccupant(
  puzzle: Puzzle,
  piece: Piece,
  row: number,
  col: number,
  now: number,
  rand: Rand,
): void {
  const occupant = puzzle.pieces.find(
    (p) => p !== piece && !p.displacing && centreInCell(puzzle, p, row, col),
  );
  if (!occupant) return;
  if (occupant.row === row && occupant.col === col && occupant.placed) return;

  occupant.placed = false;
  const free: { row: number; col: number }[] = [];
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      if (r === row && c === col) continue;
      const taken = puzzle.pieces.some(
        (p) => p !== occupant && p !== piece && !p.displacing && centreInCell(puzzle, p, r, c),
      );
      if (!taken) free.push({ row: r, col: c });
    }
  }
  const slot = free.length > 0 ? free[Math.floor(rand() * free.length)] : occupant;
  const jitterX = (rand() - 0.5) * puzzle.tileW * 0.5;
  const jitterY = (rand() - 0.5) * puzzle.tileH * 0.5;

  occupant.displacing = true;
  occupant.tween = {
    fromX: occupant.x,
    fromY: occupant.y,
    toX: puzzle.box.x + slot.col * puzzle.tileW + jitterX,
    toY: puzzle.box.y + slot.row * puzzle.tileH + jitterY,
    start: now,
  };
}

function snapToCell(puzzle: Puzzle, piece: Piece, now: number, rand: Rand): void {
  displaceOccupant(puzzle, piece, piece.row, piece.col, now, rand);
  const target = correctPosition(puzzle, piece);
  piece.x = target.x;
  piece.y = target.y;
  piece.placed = true;
}

/** Advances displacement animations. Call once per frame. */
export function stepTweens(puzzle: Puzzle, now: number): void {
  for (const piece of puzzle.pieces) {
    const tween = piece.tween;
    if (!tween) continue;
    const t = Math.min(1, (now - tween.start) / DISPLACE_ANIM_MS);
    const eased = 1 - Math.pow(1 - t, 3);
    piece.x = tween.fromX + (tween.toX - tween.fromX) * eased;
    piece.y = tween.fromY + (tween.toY - tween.fromY) * eased;
    if (t >= 1) {
      piece.x = tween.toX;
      piece.y = tween.toY;
      piece.tween = null;
      piece.displacing = false;
      clampToBoard(puzzle, piece);
    }
  }
}

export function findNearestPiece(puzzle: Puzzle, px: number, py: number): Piece | null {
  let best: Piece | null = null;
  let bestDistance = Infinity;
  for (const piece of puzzle.pieces) {
    if (piece.displacing) continue;
    const d = Math.hypot(px - (piece.x + piece.w / 2), py - (piece.y + piece.h / 2));
    if (d < Math.max(piece.w, piece.h) * 0.75 && d < bestDistance) {
      best = piece;
      bestDistance = d;
    }
  }
  return best;
}

/**
 * One pointer (a pinching hand, or the mouse) at `point`. Picks a piece up on pinch, drags it,
 * and on release snaps it home or drops it (bumping any piece already there).
 */
export function handleDrag(
  puzzle: Puzzle,
  handId: string,
  pinching: boolean,
  point: Point,
  now: number,
  rand: Rand,
): PuzzleEvent[] {
  const events: PuzzleEvent[] = [];
  const drag = puzzle.drag;

  if (pinching) {
    if (drag === null) {
      const candidate = findNearestPiece(puzzle, point.x, point.y);
      if (candidate) {
        puzzle.drag = {
          handId,
          pieceId: candidate.id,
          offsetX: point.x - candidate.x,
          offsetY: point.y - candidate.y,
        };
        candidate.dragging = true;
        candidate.placed = false;
        events.push("pickup");
      }
    } else if (drag.handId === handId) {
      const piece = puzzle.pieces[drag.pieceId];
      piece.x = point.x - drag.offsetX;
      piece.y = point.y - drag.offsetY;
    }
    return events;
  }

  if (drag === null || drag.handId !== handId) return events;

  const piece = puzzle.pieces[drag.pieceId];
  piece.dragging = false;
  if (isNearOwnCell(puzzle, piece)) {
    snapToCell(puzzle, piece, now, rand);
  } else {
    clampToBoard(puzzle, piece);
    const cx = piece.x + piece.w / 2;
    const cy = piece.y + piece.h / 2;
    const col = Math.min(GRID - 1, Math.max(0, Math.floor((cx - puzzle.box.x) / puzzle.tileW)));
    const row = Math.min(GRID - 1, Math.max(0, Math.floor((cy - puzzle.box.y) / puzzle.tileH)));
    displaceOccupant(puzzle, piece, row, col, now, rand);
  }
  puzzle.drag = null;
  const wasSolved = puzzle.solved;
  reconcile(puzzle);
  events.push("drop");
  if (piece.placed) events.push("snap");
  if (!wasSolved && puzzle.solved) events.push("complete");
  return events;
}
