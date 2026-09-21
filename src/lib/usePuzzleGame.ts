import { useCallback, useEffect, useState } from "react";

import { isSolved, placedCount, shuffledOrder, swapTiles } from "@/lib/puzzle";

export type PuzzleStatus = "ready" | "playing" | "solved";

export interface PuzzleResult {
  moves: number;
  seconds: number;
  /** Share of moves that put a tile in its right place, from 0 to 1. */
  accuracy: number;
}

/** Owns one puzzle round: tile order, move count, a clock that starts on the first swap. */
export function usePuzzleGame(onSolved?: (result: PuzzleResult) => void) {
  const [order, setOrder] = useState<number[]>(shuffledOrder);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [cleanMoves, setCleanMoves] = useState(0);
  const [status, setStatus] = useState<PuzzleStatus>("ready");

  useEffect(() => {
    if (status !== "playing") return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [status]);

  const swap = useCallback(
    (a: number, b: number) => {
      if (status === "solved" || a === b) return;
      const next = swapTiles(order, a, b);
      const nextMoves = moves + 1;
      // A clean move puts more tiles in the right place than before.
      const nextClean = cleanMoves + (placedCount(next) > placedCount(order) ? 1 : 0);
      setOrder(next);
      setMoves(nextMoves);
      setCleanMoves(nextClean);
      if (isSolved(next)) {
        setStatus("solved");
        onSolved?.({ moves: nextMoves, seconds, accuracy: nextClean / nextMoves });
      } else if (status === "ready") {
        setStatus("playing");
      }
    },
    [order, moves, seconds, cleanMoves, status, onSolved],
  );

  const shuffle = useCallback(() => {
    setOrder(shuffledOrder());
    setMoves(0);
    setSeconds(0);
    setCleanMoves(0);
    setStatus("ready");
  }, []);

  const accuracy = moves === 0 ? 1 : cleanMoves / moves;
  return { order, moves, seconds, accuracy, status, swap, shuffle };
}
