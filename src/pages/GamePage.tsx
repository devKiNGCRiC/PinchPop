import { useCallback, useState } from "react";
import { Eye, EyeOff, Lock, Shuffle } from "lucide-react";

import { Art } from "@/components/Art";
import { Confetti } from "@/components/Confetti";
import { PopButton, PopLink } from "@/components/PopButton";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { ART_LIST, artName } from "@/lib/art";
import { saveMemory } from "@/lib/memories";
import { formatTime, placedCount, scoreFor } from "@/lib/puzzle";
import { usePuzzleGame } from "@/lib/usePuzzleGame";
import type { PuzzleResult } from "@/lib/usePuzzleGame";
import { cn } from "@/lib/utils";

export default function GamePage() {
  const [artId, setArtId] = useState<string>("sunset");
  const [peek, setPeek] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const handleSolved = useCallback(
    (result: PuzzleResult) => {
      setPeek(false);
      setSavedId(saveMemory({ artId, ...result }).id);
    },
    [artId],
  );

  const { order, moves, seconds, status, swap, shuffle } = usePuzzleGame(handleSolved);
  const solved = status === "solved";

  function restart(nextArt?: string) {
    if (nextArt) setArtId(nextArt);
    setPeek(false);
    setSavedId(null);
    shuffle();
  }

  return (
    <div className="mx-auto max-w-[1120px] px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      <title>Practice booth · PinchPop</title>
      <h1 className="font-display text-[clamp(32px,6vw,64px)] leading-[0.95] font-extrabold tracking-[-0.05em]">
        Practice booth
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
        Swap the tiles until the picture snaps back together. Fewer moves and less time means a
        bigger score.
      </p>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="relative mx-auto w-full max-w-[600px]">
          {solved ? <Confetti key={savedId} /> : null}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute inset-0 -rotate-2 rounded-3xl border-[2.5px] border-ink bg-mint"
            />
            <PuzzleBoard
              artId={artId}
              order={order}
              solved={solved}
              onSwap={swap}
              className="relative"
            />
            {peek && !solved ? (
              <div className="pointer-events-none absolute inset-2 z-20 overflow-hidden rounded-2xl border-[2.5px] border-ink sm:inset-3">
                <Art artId={artId} className="size-full" />
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <section aria-labelledby="pic-heading" className="sticker-lg rounded-3xl bg-cloud p-5">
            <h2 id="pic-heading" className="font-display text-lg font-extrabold tracking-[-0.03em]">
              Pick a picture
            </h2>
            <ul className="mt-4 grid grid-cols-3 gap-3">
              {ART_LIST.map((art) => (
                <li key={art.id}>
                  <button
                    type="button"
                    aria-pressed={artId === art.id}
                    onClick={() => restart(art.id)}
                    className={cn(
                      "pop sticker block w-full overflow-hidden rounded-2xl bg-cloud p-1.5 text-left",
                      artId === art.id && "bg-lemon",
                    )}
                  >
                    <Art
                      artId={art.id}
                      decorative
                      className="block aspect-square w-full rounded-xl"
                    />
                    <span className="mt-1.5 block truncate px-1 text-sm font-semibold">
                      {art.name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-live="polite"
            aria-label="Round status"
            className="sticker-lg rounded-3xl bg-cloud p-5"
          >
            {solved ? (
              <div className="flex flex-col gap-3">
                <p className="font-display text-2xl leading-tight font-extrabold tracking-[-0.04em]">
                  Nailed it. {scoreFor(moves, seconds)} pts
                </p>
                <p className="text-base text-ink-soft">
                  {artName(artId)} solved in {moves} moves, {formatTime(seconds)}. It's on your wall
                  now.
                </p>
                <div className="mt-1 flex flex-wrap gap-3">
                  <PopLink to={`/results?m=${savedId ?? ""}`} tone="lemon">
                    See my polaroid
                  </PopLink>
                  <PopButton onClick={() => restart()} tone="white">
                    <Shuffle className="size-4" aria-hidden="true" />
                    Go again
                  </PopButton>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Stat label="Moves" value={String(moves)} />
                  <Stat label="Time" value={formatTime(seconds)} />
                  <Stat label="Placed" value={`${placedCount(order)}/9`} />
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <PopButton onClick={() => restart()} tone="pink">
                    <Shuffle className="size-4" aria-hidden="true" />
                    Shuffle
                  </PopButton>
                  <PopButton
                    onClick={() => setPeek((value) => !value)}
                    aria-pressed={peek}
                    tone={peek ? "lemon" : "white"}
                  >
                    {peek ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                    {peek ? "Hide peek" : "Peek"}
                  </PopButton>
                </div>
              </>
            )}
          </section>

          <section className="rounded-3xl border-[2.5px] border-dashed border-ink bg-lilac p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-cloud">
                <Lock className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-lg font-extrabold tracking-[-0.03em]">
                  Camera mode
                </h2>
                <p className="mt-1 text-base leading-snug text-ink-soft">
                  Snap your own face with a pinch and puzzle that instead. Not live yet, so this
                  booth uses illustrated pics for now.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-ink bg-lilac px-3 py-2">
      <p className="text-xs font-semibold text-ink-soft">{label}</p>
      <p className="font-display text-xl font-extrabold tabular-nums">{value}</p>
    </div>
  );
}
