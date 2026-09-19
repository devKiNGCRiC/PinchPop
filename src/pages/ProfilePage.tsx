import { Lock, Star } from "lucide-react";

import { Art } from "@/components/Art";
import { PopLink } from "@/components/PopButton";
import { useMemories } from "@/lib/memories";
import { formatTime } from "@/lib/puzzle";
import { BADGES, computeStats } from "@/lib/stats";
import { cn } from "@/lib/utils";

const BADGE_COLORS = ["bg-lemon", "bg-bubble", "bg-mint", "bg-tang", "bg-ultra text-white"];

export default function ProfilePage() {
  const memories = useMemories();
  const stats = computeStats(memories);

  const tiles = [
    { label: "Puzzles solved", value: String(stats.solved), color: "bg-lemon" },
    {
      label: "Best time",
      value: stats.bestSeconds === null ? "–" : formatTime(stats.bestSeconds),
      color: "bg-mint",
    },
    {
      label: "Fewest moves",
      value: stats.fewestMoves === null ? "–" : String(stats.fewestMoves),
      color: "bg-bubble",
    },
    { label: "Total score", value: String(stats.totalScore), color: "bg-cloud" },
  ];

  return (
    <div className="mx-auto max-w-[1120px] px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      <title>Profile · PinchPop</title>

      <div className="flex flex-wrap items-center gap-6">
        <div className="sticker-lg size-24 shrink-0 -rotate-3 overflow-hidden rounded-full bg-bubble sm:size-32">
          <Art artId="blob" decorative className="size-full" />
        </div>
        <div>
          <h1 className="font-display text-[clamp(32px,6vw,64px)] leading-[0.95] font-extrabold tracking-[-0.05em]">
            Guest player
          </h1>
          <p className="mt-3 max-w-md text-lg leading-relaxed text-ink-soft">
            Your stats live on this device. Accounts and syncing come later.
          </p>
        </div>
      </div>

      <dl className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {tiles.map((tile, i) => (
          <div
            key={tile.label}
            className={cn(
              "sticker-lg rounded-3xl p-5",
              tile.color,
              i % 2 === 0 ? "sm:-rotate-1" : "sm:rotate-1",
            )}
          >
            <dt className="text-base font-semibold">{tile.label}</dt>
            <dd className="mt-2 font-display text-[clamp(28px,4.4vw,48px)] leading-none font-extrabold tracking-[-0.05em] tabular-nums">
              {tile.value}
            </dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="badges-heading" className="mt-16">
        <h2
          id="badges-heading"
          className="font-display text-[clamp(26px,4vw,40px)] leading-tight font-extrabold tracking-[-0.045em]"
        >
          Badges
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
                    : "border-[2.5px] border-dashed border-ink/60 bg-cloud/50",
                )}
              >
                <span
                  className={cn(
                    "flex size-14 shrink-0 items-center justify-center rounded-2xl border-[2.5px] border-ink",
                    earned ? "bg-cloud text-ink" : "bg-lilac text-ink-soft",
                  )}
                >
                  {earned ? (
                    <Star className="size-7 fill-lemon" aria-hidden="true" />
                  ) : (
                    <Lock className="size-6" aria-hidden="true" />
                  )}
                </span>
                <div>
                  <p className="font-display text-lg leading-tight font-extrabold tracking-[-0.03em]">
                    {badge.name}
                    <span className="sr-only">{earned ? " (earned)" : " (locked)"}</span>
                  </p>
                  <p className={cn("text-base", earned ? "" : "text-ink-soft")}>{badge.hint}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {memories.length === 0 ? (
        <div className="mt-14">
          <PopLink to="/game" tone="lemon" size="lg">
            Earn your first badge
          </PopLink>
        </div>
      ) : null}
    </div>
  );
}
