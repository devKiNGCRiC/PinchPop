import { useCallback, useState } from "react";
import { Camera, Check, Eye, EyeOff, Shuffle } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import { Art } from "@/components/Art";
import { Confetti } from "@/components/Confetti";
import { PopButton, PopLink } from "@/components/PopButton";
import { PuzzleBoard } from "@/components/PuzzleBoard";
import { Seo } from "@/components/Seo";
import { Stamp } from "@/components/Stamp";
import { ART_LIST, getArt, isArtId } from "@/lib/art";
import type { ArtId } from "@/lib/art";
import { saveMemory, useMemories } from "@/lib/memories";
import { formatAccuracy, formatTime, placedCount, scoreFor } from "@/lib/puzzle";
import { usePuzzleGame } from "@/lib/usePuzzleGame";
import type { PuzzleResult } from "@/lib/usePuzzleGame";
import { cn } from "@/lib/utils";

/** Reads the destination from the URL, so footer and Home links can deep-link straight to a puzzle. */
export default function GamePage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get("art");
  const artId: ArtId = isArtId(requested) ? requested : "taj";

  // Keyed by destination: choosing a new place starts a fresh round with a clean clock.
  return <PracticeBooth key={artId} artId={artId} onPick={(id) => setParams({ art: id })} />;
}

function PracticeBooth({ artId, onPick }: { artId: ArtId; onPick: (id: ArtId) => void }) {
  const art = getArt(artId);
  const memories = useMemories();
  const [peek, setPeek] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [newStamp, setNewStamp] = useState(false);

  const handleSolved = useCallback(
    (result: PuzzleResult) => {
      const firstVisit = !memories.some((m) => getArt(m.artId).id === artId);
      setPeek(false);
      setNewStamp(firstVisit);
      setSavedId(saveMemory({ artId, ...result }).id);
    },
    [artId, memories],
  );

  const { order, moves, seconds, accuracy, status, swap, shuffle } = usePuzzleGame(handleSolved);
  const solved = status === "solved";

  function restart() {
    setPeek(false);
    setSavedId(null);
    setNewStamp(false);
    shuffle();
  }

  return (
    <div className="mx-auto max-w-280 px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      <Seo
        title="Practice booth"
        description={`Swap tiles with your mouse, finger or keyboard to solve the ${art.place} puzzle and earn its passport stamp. No camera needed.`}
        path="/game"
      />
      <h1 className="font-display text-[clamp(32px,6vw,64px)] leading-[0.95] font-extrabold tracking-[-0.05em]">
        Practice booth
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
        Swap the tiles until {art.name} comes back together. Fewer moves and less time means a
        bigger score.{" "}
        <Link to="/how-to-play" className="font-semibold text-chakra underline underline-offset-4">
          How to play
        </Link>
      </p>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="relative mx-auto w-full max-w-150">
          {solved ? <Confetti key={savedId} /> : null}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute inset-0 -rotate-2 rounded-3xl border-[2.5px] border-ink bg-saffron"
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
          <p className="mt-5 flex items-center justify-center gap-2 text-center text-base text-ink-soft">
            <span className="flex size-5 items-center justify-center rounded-full border-2 border-ink bg-leaf">
              <Check className="size-3 text-white" strokeWidth={4} aria-hidden="true" />
            </span>
            marks a tile that is already in the right place
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <section aria-labelledby="dest-heading" className="sticker-lg rounded-3xl bg-cloud p-5">
            <h2
              id="dest-heading"
              className="font-display text-lg font-extrabold tracking-[-0.03em]"
            >
              Pick a destination
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2">
              {ART_LIST.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    aria-pressed={artId === option.id}
                    onClick={() => onPick(option.id)}
                    className={cn(
                      "pop sticker block w-full overflow-hidden rounded-2xl p-1.5 text-left",
                      artId === option.id ? "bg-marigold" : "bg-white",
                    )}
                  >
                    <Art
                      artId={option.id}
                      decorative
                      className="block aspect-square w-full rounded-xl"
                    />
                    <span className="mt-1.5 block truncate px-1 text-sm font-semibold">
                      {option.place}
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
                  Nailed it. {scoreFor(moves, seconds, accuracy)} pts
                </p>
                {newStamp ? (
                  <div className="flex items-center gap-3 rounded-2xl border-2 border-ink bg-marigold/40 p-3">
                    <Stamp art={art} earned className="size-16 shrink-0" />
                    <p className="text-base leading-snug">
                      <strong className="font-semibold">New stamp!</strong> {art.place} is now in
                      your passport.
                    </p>
                  </div>
                ) : null}
                <p className="text-base text-ink-soft">
                  {art.name} solved in {moves} moves, {formatTime(seconds)},{" "}
                  {formatAccuracy(accuracy)} accuracy. It is pinned to your album.
                </p>
                <div className="mt-1 flex flex-wrap gap-3">
                  <PopLink to={`/results?m=${savedId ?? ""}`} tone="saffron">
                    See my polaroid
                  </PopLink>
                  <PopButton onClick={restart} tone="white">
                    <Shuffle className="size-4" aria-hidden="true" />
                    Go again
                  </PopButton>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <Stat label="Moves" value={String(moves)} hint="Swaps you have made" />
                  <Stat label="Time" value={formatTime(seconds)} hint="Runs from your first swap" />
                  <Stat
                    label="Placed"
                    value={`${placedCount(order)}/9`}
                    hint="Tiles in the right place"
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <PopButton onClick={restart} tone="coral">
                    <Shuffle className="size-4" aria-hidden="true" />
                    Shuffle
                  </PopButton>
                  <PopButton
                    onClick={() => setPeek((value) => !value)}
                    aria-pressed={peek}
                    tone={peek ? "marigold" : "white"}
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

          <section className="sticker-lg rounded-3xl bg-chakra p-5 text-white">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-marigold text-ink">
                <Camera className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-lg font-extrabold tracking-[-0.03em]">
                  Camera mode
                </h2>
                <p className="mt-1 text-base leading-snug text-white/85">
                  Frame and pinch to shoot your own photo with your hands, then solve that.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <PopLink to="/camera" tone="saffron" size="md">
                Open camera mode
              </PopLink>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border-2 border-ink bg-ivory px-3 py-2" title={hint}>
      <p className="text-xs font-semibold text-ink-soft">{label}</p>
      <p className="font-display text-xl font-extrabold tabular-nums">{value}</p>
    </div>
  );
}
