import { useEffect, useState } from "react";
import { Globe, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";

import { Art } from "@/components/Art";
import { getArt } from "@/lib/art";
import type { CloudRun } from "@/lib/cloudRuns";
import { formatTime } from "@/lib/puzzle";
import { cn } from "@/lib/utils";

type Status = "loading" | "ready" | "error";

/**
 * The real, cross-device leaderboard: every signed-in player's synced runs, best score first.
 * A separate board from the "your runs on this device" one above it — merging the two would mean
 * reconciling local-only period/place filtering against a live network fetch, which is its own
 * piece of work. This one is always all-time, all-destinations, top 20.
 */
export function WorldwideLeaderboard() {
  const [status, setStatus] = useState<Status>("loading");
  const [runs, setRuns] = useState<CloudRun[]>([]);

  useEffect(() => {
    let active = true;
    import("@/lib/cloudRuns")
      .then(({ fetchWorldwideLeaderboard }) => fetchWorldwideLeaderboard(20))
      .then((result) => {
        if (active) {
          setRuns(result);
          setStatus("ready");
        }
      })
      .catch((error: unknown) => {
        console.warn("[PinchPop] Could not load the worldwide leaderboard:", error);
        if (active) setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      aria-labelledby="worldwide-heading"
      className="sticker-lg mt-12 rounded-3xl bg-white p-6 sm:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl border-2 border-ink bg-chakra text-white">
          <Globe className="size-6" aria-hidden="true" />
        </span>
        <h2
          id="worldwide-heading"
          className="font-display text-xl font-extrabold tracking-[-0.03em]"
        >
          Worldwide
        </h2>
      </div>

      {status === "loading" ? (
        <div className="mt-6 flex items-center gap-2 text-base text-ink-soft">
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          Loading real-time scores…
        </div>
      ) : status === "error" ? (
        <p className="mt-4 text-base text-ink-soft">
          Could not load the worldwide board right now. Try again shortly.
        </p>
      ) : runs.length === 0 ? (
        <p className="mt-4 text-base text-ink-soft">
          No signed-in runs yet —{" "}
          <Link to="/account" className="font-semibold text-chakra underline underline-offset-4">
            sign in
          </Link>{" "}
          and be the first name on this board.
        </p>
      ) : (
        <ol className="mt-5 flex flex-col gap-2">
          {runs.map((run, i) => {
            const art = getArt(run.artId);
            return (
              <li
                key={run.id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5",
                  i < 3 ? "bg-marigold/25" : "bg-ivory",
                )}
              >
                <span className="w-6 shrink-0 text-center font-display font-extrabold tabular-nums text-ink-soft">
                  {i + 1}
                </span>
                <Art
                  artId={run.artId}
                  decorative
                  className="size-9 shrink-0 rounded-lg border-2 border-ink"
                />
                <span className="min-w-0 flex-1 truncate font-semibold">{run.username}</span>
                <span className="hidden text-sm text-ink-soft sm:inline">{art.place}</span>
                <span className="w-16 shrink-0 text-right text-sm text-ink-soft">
                  {run.moves}mv · {formatTime(run.seconds)}
                </span>
                <span className="w-14 shrink-0 text-right font-display font-extrabold tabular-nums">
                  {run.score}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
