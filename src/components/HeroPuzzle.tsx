import { useCallback, useState } from "react";
import { Shuffle } from "lucide-react";

import { Confetti } from "@/components/Confetti";
import { PopButton, PopLink } from "@/components/PopButton";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { saveMemory } from "@/lib/memories";
import { formatTime, placedCount } from "@/lib/puzzle";
import { usePuzzleGame } from "@/lib/usePuzzleGame";
import type { PuzzleResult } from "@/lib/usePuzzleGame";

const HERO_ART = "blob";

/** The landing page's playable puzzle: the whole product loop in one card, no camera needed. */
export function HeroPuzzle() {
  const [savedId, setSavedId] = useState<string | null>(null);

  const handleSolved = useCallback((result: PuzzleResult) => {
    const memory = saveMemory({ artId: HERO_ART, ...result });
    setSavedId(memory.id);
  }, []);

  const { order, moves, seconds, status, swap, shuffle } = usePuzzleGame(handleSolved);
  const solved = status === "solved";

  function playAgain() {
    setSavedId(null);
    shuffle();
  }

  return (
    <div className="relative mx-auto w-full max-w-[460px]">
      {solved ? <Confetti key={savedId} /> : null}

      <div className="relative">
        {/* Tilted backing sticker; the board itself stays square so drag maths stay exact. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rotate-3 rounded-3xl border-[2.5px] border-ink bg-bubble"
        />
        <PuzzleBoard
          artId={HERO_ART}
          order={order}
          solved={solved}
          onSwap={swap}
          className="relative"
        />
      </div>

      <div className="sticker-lg mt-6 rounded-3xl bg-cloud p-4 text-ink" aria-live="polite">
        {solved ? (
          <div className="flex flex-col gap-3">
            <p className="font-display text-xl leading-tight font-extrabold tracking-[-0.03em]">
              Solved in {moves} moves, {formatTime(seconds)}.
            </p>
            <p className="text-base text-ink-soft">Saved to your gallery as a polaroid.</p>
            <div className="flex flex-wrap gap-3">
              <PopLink to={`/results?m=${savedId ?? ""}`} tone="lemon" size="md">
                See my polaroid
              </PopLink>
              <PopButton onClick={playAgain} tone="white" size="md">
                <Shuffle className="size-4" aria-hidden="true" />
                Go again
              </PopButton>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-2.5">
              <span className="rounded-2xl border-2 border-ink bg-lilac px-3 py-1.5 leading-tight">
                <span className="block text-xs font-semibold text-ink-soft">Moves</span>
                <span className="font-display text-lg font-extrabold tabular-nums">{moves}</span>
              </span>
              <span className="rounded-2xl border-2 border-ink bg-lilac px-3 py-1.5 leading-tight">
                <span className="block text-xs font-semibold text-ink-soft">Time</span>
                <span className="font-display text-lg font-extrabold tabular-nums">
                  {formatTime(seconds)}
                </span>
              </span>
              <span className="hidden rounded-2xl border-2 border-ink bg-lilac px-3 py-1.5 leading-tight sm:block">
                <span className="block text-xs font-semibold text-ink-soft">Placed</span>
                <span className="font-display text-lg font-extrabold tabular-nums">
                  {placedCount(order)}/9
                </span>
              </span>
            </div>
            <PopButton onClick={shuffle} tone="pink" size="sm" aria-label="Shuffle the tiles">
              <Shuffle className="size-4" aria-hidden="true" />
              Shuffle
            </PopButton>
          </div>
        )}
      </div>

      <p className="mt-4 text-center font-hand text-[28px] leading-none font-bold text-lemon">
        {solved ? "you did that." : "drag a tile onto another to swap"}
      </p>
    </div>
  );
}
