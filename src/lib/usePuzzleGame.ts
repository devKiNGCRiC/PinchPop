import { useCallback, useEffect, useState } from "react";

import { isSolved, shuffledOrder, swapTiles } from "@/lib/puzzle";

export type PuzzleStatus = "ready" | "playing" | "solved";

export interface PuzzleResult {
  moves: number;
  seconds: number;
}

/** Owns one puzzle round: tile order, move count, a clock that starts on the first swap. */
export function usePuzzleGame(onSolved?: (result: PuzzleResult) => void) {
  const [order, setOrder] = useState<number[]>(shuffledOrder);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
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
      setOrder(next);
      setMoves(nextMoves);
      if (isSolved(next)) {
        setStatus("solved");
        onSolved?.({ moves: nextMoves, seconds });
      } else if (status === "ready") {
        setStatus("playing");
      }
    },
    [order, moves, seconds, status, onSolved],
  );

  const shuffle = useCallback(() => {
    setOrder(shuffledOrder());
    setMoves(0);
    setSeconds(0);
    setStatus("ready");
  }, []);

  return { order, moves, seconds, status, swap, shuffle };
}
