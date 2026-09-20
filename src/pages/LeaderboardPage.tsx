import { useMemo, useState } from "react";
import { Crown, Globe, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

import { MemoryImage } from "@/components/MemoryImage";
import { EmptyState } from "@/components/EmptyState";
import { PopLink } from "@/components/PopButton";
import { getArt, PLACE_LIST } from "@/lib/art";
import { rankRuns, todayKey } from "@/lib/leaderboard";
import type { Period, PlaceFilter } from "@/lib/leaderboard";
import { useMemories } from "@/lib/memories";
import { formatTime } from "@/lib/puzzle";
import type { Memory } from "@/lib/memories";
import { formatDate } from "@/lib/stats";
import { cn } from "@/lib/utils";

const PERIODS: { id: Period; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "today", label: "Today" },
];

// Gold, silver and bronze, in the palette: marigold, white, saffron.
const PODIUM = [
  { rank: 1, color: "bg-marigold", height: "h-32 sm:h-40", slot: "order-2" },
  { rank: 2, color: "bg-white", height: "h-24 sm:h-28", slot: "order-1" },
  { rank: 3, color: "bg-saffron", height: "h-20 sm:h-24", slot: "order-3" },
];

export default function LeaderboardPage() {
  const memories = useMemories();
  const [period, setPeriod] = useState<Period>("all");
  const [place, setPlace] = useState<PlaceFilter>("all");
  const [today] = useState(todayKey);

  const runs = useMemo(
    () => rankRuns(memories, { period, place, today }),
    [memories, period, place, today],
  );
  const rest = runs.slice(3);

  return (
    <div className="mx-auto max-w-280 px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      <title>Leaderboard · PinchPop</title>
      <h1 className="font-display text-[clamp(32px,6vw,64px)] leading-[0.95] font-extrabold tracking-[-0.05em]">
        Leaderboard
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
        The fastest, tidiest solves. For now this board ranks your own runs on this device.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label="Time period"
          className="sticker flex rounded-full bg-cloud p-1"
        >
          {PERIODS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={period === option.id}
              onClick={() => setPeriod(option.id)}
              className={cn(
                "h-10 rounded-full px-5 text-[15px] font-semibold transition-colors",
                period === option.id ? "bg-chakra text-white" : "hover:bg-marigold/40",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-ink-soft">
          {period === "today" ? "Today resets at midnight UTC." : "Every run you have saved."}
        </p>
      </div>

      <div role="group" aria-label="Filter by destination" className="mt-5 flex flex-wrap gap-2.5">
        {[{ id: "all" as const, place: "All places", swatch: "bg-white" }, ...PLACE_LIST].map(
          (option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={place === option.id}
              onClick={() => setPlace(option.id)}
              className={cn(
                "pop sticker inline-flex h-11 items-center gap-2 rounded-full px-4 text-[15px] font-semibold",
                place === option.id ? "bg-marigold" : "bg-white",
              )}
            >
              <span
                aria-hidden="true"
                className={cn("size-3 rounded-full border-2 border-ink", option.swatch)}
              />
              {option.place}
            </button>
          ),
        )}
      </div>

      {runs.length === 0 ? (
        <div className="mt-16">
          <EmptyState
            title={period === "today" ? "No runs today yet" : "No runs to rank yet"}
            body={
              memories.length === 0
                ? "Solve a puzzle and your score takes its place on the podium."
                : "Nothing matches these filters. Try another destination, or play a fresh run."
            }
          >
            <PopLink to="/game" tone="saffron" size="lg">
              Play a run
            </PopLink>
          </EmptyState>
        </div>
      ) : (
        <>
          <ol
            aria-label="Top three runs"
            className="mx-auto mt-14 grid max-w-2xl grid-cols-3 items-end gap-3 sm:gap-5"
          >
            {PODIUM.map(({ rank, color, height, slot }) => {
              const run = runs[rank - 1];
              return (
                <li key={rank} className={cn("flex flex-col items-center", slot)}>
                  <PodiumTop run={run} rank={rank} />
                  <div
                    className={cn(
                      "sticker-lg mt-3 flex w-full items-start justify-center rounded-t-3xl pt-3 font-display text-4xl font-extrabold",
                      color,
                      height,
                    )}
                  >
                    <span className="sr-only">Rank </span>
                    {rank}
                  </div>
                </li>
              );
            })}
          </ol>

          {rest.length > 0 ? (
            <div className="sticker-lg mt-12 overflow-hidden rounded-3xl bg-white">
              <table className="w-full text-left text-base">
                <caption className="sr-only">Ranked runs from fourth place</caption>
                <thead className="bg-ivory text-sm text-ink-soft">
                  <tr>
                    <th scope="col" className="w-14 px-4 py-3 font-semibold">
                      Rank
                    </th>
                    <th scope="col" className="px-2 py-3 font-semibold">
                      Destination
                    </th>
                    <th scope="col" className="px-2 py-3 text-right font-semibold">
                      Score
                    </th>
                    <th
                      scope="col"
                      className="hidden px-2 py-3 text-right font-semibold sm:table-cell"
                    >
                      Moves
                    </th>
                    <th scope="col" className="px-2 py-3 text-right font-semibold">
                      Time
                    </th>
                    <th
                      scope="col"
                      className="hidden px-4 py-3 text-right font-semibold sm:table-cell"
                    >
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((run, i) => {
                    const art = getArt(run.artId);
                    return (
                      <tr key={run.id} className="border-t-2 border-ink/10">
                        <td className="px-4 py-3 font-display font-extrabold">{i + 4}</td>
                        <td className="px-2 py-2">
                          <Link
                            to={`/results?m=${run.id}`}
                            className="inline-flex min-h-11 items-center gap-3 font-semibold underline-offset-4 hover:underline"
                          >
                            <MemoryImage
                              memory={run}
                              className="size-9 shrink-0 rounded-lg border-2 border-ink"
                            />
                            {art.place}
                          </Link>
                        </td>
                        <td className="px-2 py-3 text-right font-display font-extrabold tabular-nums">
                          {run.score}
                        </td>
                        <td className="hidden px-2 py-3 text-right tabular-nums sm:table-cell">
                          {run.moves}
                        </td>
                        <td className="px-2 py-3 text-right tabular-nums">
                          {formatTime(run.seconds)}
                        </td>
                        <td className="hidden px-4 py-3 text-right text-ink-soft sm:table-cell">
                          {formatDate(run.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </>
      )}

      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="scoring-heading" className="sticker-lg rounded-3xl bg-cloud p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl border-2 border-ink bg-marigold">
              <Trophy className="size-6" aria-hidden="true" />
            </span>
            <h2
              id="scoring-heading"
              className="font-display text-xl font-extrabold tracking-[-0.03em]"
            >
              How scores work
            </h2>
          </div>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            You start at 2000. Every move costs 40 and every second costs 8. The lowest score is
            100, so a slow solve still counts.
          </p>
          <p className="mt-3 text-base text-ink-soft">
            Example: 7 moves in 20 seconds is 2000 − 280 − 160 = 1560.
          </p>
        </section>

        <section
          aria-labelledby="online-heading"
          className="rounded-3xl border-[2.5px] border-dashed border-ink bg-white/60 p-6"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl border-2 border-ink bg-cloud">
              <Globe className="size-6" aria-hidden="true" />
            </span>
            <h2
              id="online-heading"
              className="font-display text-xl font-extrabold tracking-[-0.03em]"
            >
              Online rankings are coming
            </h2>
          </div>
          <p className="mt-4 text-lg leading-relaxed text-ink-soft">
            Worldwide all-time and daily boards arrive with accounts. Until then, the open podium
            spots are waiting for you to fill them.
          </p>
        </section>
      </div>
    </div>
  );
}

function PodiumTop({ run, rank }: { run: Memory | undefined; rank: number }) {
  if (!run) {
    return (
      <div className="flex flex-col items-center text-center">
        <span
          aria-hidden="true"
          className="size-14 rounded-full border-[2.5px] border-dashed border-ink/60 bg-white/50 sm:size-20"
        />
        <p className="mt-2 text-sm font-semibold text-ink-soft">Open spot</p>
      </div>
    );
  }

  const art = getArt(run.artId);
  return (
    <Link
      to={`/results?m=${run.id}`}
      aria-label={`Rank ${rank}: ${art.place}, ${run.score} points`}
      className="group flex flex-col items-center text-center"
    >
      <span className="relative">
        {rank === 1 ? (
          <Crown
            className="absolute -top-6 left-1/2 size-7 -translate-x-1/2 fill-marigold text-ink"
            aria-hidden="true"
          />
        ) : null}
        <MemoryImage memory={run} className="pop sticker size-14 rounded-full sm:size-20" />
      </span>
      <span className="mt-2 font-display text-lg font-extrabold tracking-tighter tabular-nums sm:text-2xl">
        {run.score}
      </span>
      <span className="text-sm font-semibold text-ink-soft">{art.place}</span>
      <span className="text-xs text-ink-soft">
        {run.moves} moves · {formatTime(run.seconds)}
      </span>
    </Link>
  );
}
