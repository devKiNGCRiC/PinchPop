import { Lock, Star } from "lucide-react";
import { Link } from "react-router-dom";

import { Chakra } from "@/components/Chakra";
import { PopLink } from "@/components/PopButton";
import { Stamp } from "@/components/Stamp";
import { ART_LIST } from "@/lib/art";
import { useMemories } from "@/lib/memories";
import { formatTime } from "@/lib/puzzle";
import { BADGES, computeStats, visitedPlaces } from "@/lib/stats";
import { cn } from "@/lib/utils";

// Earned milestones borrow the flag's colours in turn.
const BADGE_COLORS = ["bg-saffron", "bg-white", "bg-leaf text-white", "bg-marigold", "bg-coral"];

export default function ProfilePage() {
  const memories = useMemories();
  const stats = computeStats(memories);
  const visited = visitedPlaces(memories);

  const tiles = [
    { label: "Puzzles solved", value: String(stats.solved), color: "bg-marigold text-ink" },
    {
      label: "Best time",
      value: stats.bestSeconds === null ? "–" : formatTime(stats.bestSeconds),
      color: "bg-leaf text-white",
    },
    {
      label: "Fewest moves",
      value: stats.fewestMoves === null ? "–" : String(stats.fewestMoves),
      color: "bg-saffron text-ink",
    },
    { label: "Total score", value: String(stats.totalScore), color: "bg-white text-ink" },
  ];

  return (
    <div className="mx-auto max-w-280 px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      <title>Passport · PinchPop</title>

      <div className="grid items-center gap-10 lg:grid-cols-[320px_1fr]">
        {/* The passport cover: Ashoka blue, a gold wheel, the holder's name. */}
        <div className="sticker-lg mx-auto w-full max-w-xs -rotate-2 rounded-3xl bg-chakra p-7 text-center text-white">
          <p className="font-display text-sm font-extrabold tracking-widest text-marigold">
            PINCHPOP
          </p>
          <Chakra spokes={24} className="mx-auto my-6 size-32 text-marigold" />
          <p className="font-display text-lg font-extrabold tracking-tight">Travel passport</p>
          <p className="mt-6 rounded-xl border-2 border-marigold/60 px-3 py-2 text-base font-semibold">
            Guest traveller
          </p>
        </div>

        <div>
          <h1 className="font-display text-[clamp(32px,6vw,64px)] leading-[0.95] font-extrabold tracking-[-0.05em]">
            Your passport
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
            Stamps and stats live on this device. Accounts and syncing come later.
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-4 sm:gap-5">
            {tiles.map((tile) => (
              <div key={tile.label} className={cn("sticker-lg rounded-3xl p-5", tile.color)}>
                <dt className="text-base font-semibold">{tile.label}</dt>
                <dd className="mt-2 font-display text-[clamp(28px,4.4vw,44px)] leading-none font-extrabold tracking-tighter tabular-nums">
                  {tile.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section aria-labelledby="stamps-heading" className="mt-20">
        <h2
          id="stamps-heading"
          className="font-display text-[clamp(26px,4vw,40px)] leading-tight font-extrabold tracking-[-0.045em]"
        >
          Stamps
          <span className="ml-3 tracking-normal text-ink-soft">
            {visited.size} of {ART_LIST.length}
          </span>
        </h2>
        <p className="mt-3 max-w-xl text-lg text-ink-soft">
          Solve a destination once to earn its stamp.
        </p>
        <ul className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {ART_LIST.map((art) => {
            const earned = visited.has(art.id);
            return (
              <li key={art.id} className="text-center">
                <Link
                  to={`/game?art=${art.id}`}
                  aria-label={
                    earned ? `${art.place} stamp collected, play again` : `Visit ${art.place}`
                  }
                  className="pop sticker block rounded-3xl bg-white p-4"
                >
                  <Stamp art={art} earned={earned} className="mx-auto size-28 sm:size-32" />
                  <span className="mt-3 block font-display text-lg font-extrabold tracking-[-0.03em]">
                    {art.place}
                  </span>
                  <span className="block text-sm text-ink-soft">
                    {earned ? art.name : "Not visited yet"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="milestones-heading" className="mt-20">
        <h2
          id="milestones-heading"
          className="font-display text-[clamp(26px,4vw,40px)] leading-tight font-extrabold tracking-[-0.045em]"
        >
          Milestones
        </h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BADGES.map((badge, i) => {
            const earned = badge.earned(memories);
            return (
              <li
                key={badge.id}
                className={cn(
                  "flex items-center gap-4 rounded-3xl p-4",
                  earned
                    ? cn("sticker", BADGE_COLORS[i % BADGE_COLORS.length])
                    : "border-[2.5px] border-dashed border-ink/60 bg-white/50",
                )}
              >
                <span
                  className={cn(
                    "flex size-14 shrink-0 items-center justify-center rounded-2xl border-[2.5px] border-ink text-ink",
                    earned ? "bg-cloud" : "bg-ivory text-ink-soft",
                  )}
                >
                  {earned ? (
                    <Star className="size-7 fill-marigold" aria-hidden="true" />
                  ) : (
                    <Lock className="size-6" aria-hidden="true" />
                  )}
                </span>
                <div>
                  <p className="font-display text-lg leading-tight font-extrabold tracking-[-0.03em]">
                    {badge.name}
                    <span className="sr-only">{earned ? " (earned)" : " (locked)"}</span>
                  </p>
                  <p className={cn("text-base", !earned && "text-ink-soft")}>{badge.hint}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {memories.length === 0 ? (
        <div className="mt-14">
          <PopLink to="/game" tone="saffron" size="lg">
            Earn your first stamp
          </PopLink>
        </div>
      ) : null}
    </div>
  );
}
