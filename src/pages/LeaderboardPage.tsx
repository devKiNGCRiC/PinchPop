import { useMemo, useState } from "react";
import { ChevronDown, Crown, Globe, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";

import { MemoryImage } from "@/components/MemoryImage";
import { EmptyState } from "@/components/EmptyState";
import { PopLink } from "@/components/PopButton";
import { Seo } from "@/components/Seo";
import { WorldwideLeaderboard } from "@/components/WorldwideLeaderboard";
import { getArt, PLACE_LIST } from "@/lib/art";
import { ownRank, rankRuns, todayKey } from "@/lib/leaderboard";
import type { Period, PlaceFilter } from "@/lib/leaderboard";
import { useMemories } from "@/lib/memories";
import { formatTime } from "@/lib/puzzle";
import type { Memory } from "@/lib/memories";
import { formatDate } from "@/lib/stats";
import { cn } from "@/lib/utils";

type Board = "world" | "device";

const BOARDS: { id: Board; label: string; Icon: typeof Globe }[] = [
  { id: "world", label: "Worldwide", Icon: Globe },
  { id: "device", label: "Your runs", Icon: Smartphone },
];

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
  const [board, setBoard] = useState<Board>("world");

  return (
    <div className="mx-auto max-w-280 px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      <Seo
        title="Leaderboard"
        description="The fastest, tidiest PinchPop solves worldwide, plus your own best runs on this device."
        path="/leaderboard"
      />
      <h1 className="font-display text-[clamp(32px,6vw,64px)] leading-[0.95] font-extrabold tracking-[-0.05em]">
        Leaderboard
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
        The fastest, tidiest solves. Fewer moves and a quicker time score higher.
      </p>

      <div
        role="tablist"
        aria-label="Which leaderboard"
        className="sticker mt-8 inline-flex rounded-full bg-cloud p-1"
      >
        {BOARDS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={board === id}
            aria-controls={`panel-${id}`}
            onClick={() => setBoard(id)}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-full px-5 text-[15px] font-semibold transition-colors",
              board === id ? "bg-chakra text-white" : "hover:bg-marigold/40",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${board}`} aria-labelledby={`tab-${board}`} className="mt-8">
        {board === "world" ? <WorldwideLeaderboard /> : <DeviceBoard />}
      </div>

      <details className="group mt-14 max-w-2xl rounded-3xl border-2 border-dashed border-ink/25 p-5 sm:p-6">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-display text-lg font-extrabold tracking-tight">
          How scores work
          <ChevronDown
            className="size-5 shrink-0 transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="mt-3 space-y-3 text-base leading-relaxed text-ink-soft">
          <p>
            Every run starts at 2,000 points. Each move takes off 40 points and each second takes
            off 8, but you never drop below 100.
          </p>
          <p>
            Careful moves keep more of your score: the more of your moves that put a piece in its
            right spot, the closer you stay to the full amount.
          </p>
          <p>For example, 7 moves in 20 seconds with no wasted moves scores 1,560.</p>
        </div>
      </details>
    </div>
  );
}

/** Runs saved in this browser, with period and destination filters and a podium. */
function DeviceBoard() {
  const memories = useMemories();
  const [period, setPeriod] = useState<Period>("all");
  const [place, setPlace] = useState<PlaceFilter>("all");
  const [today] = useState(todayKey);

  const runs = useMemo(
    () => rankRuns(memories, { period, place, today }),
    [memories, period, place, today],
  );
  const rest = runs.slice(3);
  // Your rank among these filters, kept visible even once it scrolls off the podium/table (LEAD-03).
  const mine = useMemo(
    () => ownRank(memories, { period, place, today }),
    [memories, period, place, today],
  );

  return (
    <div>
      <p className="max-w-xl text-base text-ink-soft">
        Every run saved on this device, signed in or not.
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
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
        {period === "today" ? (
          <p className="text-sm text-ink-soft">Today resets at midnight UTC.</p>
        ) : null}
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

      {mine ? (
        <p className="sticker mt-6 inline-flex flex-wrap items-center gap-2 rounded-2xl bg-white px-4 py-3 text-base">
          <span className="font-semibold">Your latest run ranks</span>
          <span className="font-display font-extrabold tabular-nums">
            #{mine.rank} of {mine.total}
          </span>
          {mine.offScreen ? (
            <Link
              to={`/results?m=${mine.memory.id}`}
              className="font-semibold text-chakra underline underline-offset-4"
            >
              Open that run
            </Link>
          ) : null}
        </p>
      ) : null}

      {runs.length === 0 ? (
        <div className="mt-12">
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
            <div className="sticker-lg mt-12 overflow-x-auto rounded-3xl bg-white">
              <table className="w-full text-left text-base sm:min-w-105">
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
                    <th
                      scope="col"
                      className="hidden px-2 py-3 text-right font-semibold sm:table-cell"
                    >
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
                        <td className="hidden px-2 py-3 text-right tabular-nums sm:table-cell">
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
