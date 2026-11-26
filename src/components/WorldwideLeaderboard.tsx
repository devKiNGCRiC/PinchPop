import { useEffect, useState } from "react";
import { LoaderCircle, Trophy } from "lucide-react";
import { Link } from "react-router-dom";

import { Art } from "@/components/Art";
import { PopLink } from "@/components/PopButton";
import { getArt } from "@/lib/art";
import { useSession } from "@/lib/auth";
import { avatarUrl } from "@/lib/avatar";
import type { CloudRun } from "@/lib/cloudRuns";
import { formatTime } from "@/lib/puzzle";
import { cn } from "@/lib/utils";

type Status = "loading" | "ready" | "error";

/** Every signed-in player's synced runs, best score first — always all-time, all places, top 20. */
export function WorldwideLeaderboard() {
  const { session } = useSession();
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

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 text-base text-ink-soft">
        <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        Loading scores…
      </div>
    );
  }

  if (status === "error") {
    return (
      <p className="text-base text-ink-soft">
        Couldn't load the worldwide board. Check your connection and refresh the page.
      </p>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="sticker-lg max-w-2xl rounded-3xl bg-white p-6 sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-marigold">
          <Trophy className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-extrabold tracking-tight">
          Be the first name here
        </h2>
        <p className="mt-2 text-lg leading-relaxed text-ink-soft">
          The worldwide board is empty.{" "}
          {session
            ? "Solve a puzzle and your score goes straight to the top."
            : "Sign in, solve a puzzle, and your score goes straight to the top."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          {session ? null : (
            <PopLink to="/account" tone="chakra">
              Sign in
            </PopLink>
          )}
          <PopLink to="/game" tone="saffron">
            Play a run
          </PopLink>
        </div>
      </div>
    );
  }

  return (
    <div>
      {session ? null : (
        <p className="mb-4 max-w-xl text-base text-ink-soft">
          Only signed-in players appear here.{" "}
          <Link to="/account" className="font-semibold text-chakra underline underline-offset-4">
            Sign in
          </Link>{" "}
          to post your runs.
        </p>
      )}
      <ol className="sticker-lg flex flex-col gap-2 rounded-3xl bg-white p-3 sm:p-4">
        {runs.map((run, i) => {
          const art = getArt(run.artId);
          const avatar = avatarUrl(run.avatarPath);
          return (
            <li key={run.id}>
              <Link
                to={`/players/${encodeURIComponent(run.username)}`}
                aria-label={`${run.username}'s public profile`}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-marigold/40",
                  i < 3 ? "bg-marigold/25" : "bg-ivory",
                )}
              >
                <span className="w-6 shrink-0 text-center font-display font-extrabold tabular-nums text-ink-soft">
                  {i + 1}
                </span>
                {avatar ? (
                  <img
                    src={avatar}
                    alt=""
                    className="size-9 shrink-0 rounded-lg border-2 border-ink object-cover"
                  />
                ) : (
                  <Art
                    artId={run.artId}
                    decorative
                    className="size-9 shrink-0 rounded-lg border-2 border-ink"
                  />
                )}
                <span className="min-w-0 flex-1 truncate font-semibold">{run.username}</span>
                <span className="hidden text-sm text-ink-soft sm:inline">{art.place}</span>
                <span className="hidden shrink-0 text-right text-sm whitespace-nowrap text-ink-soft sm:inline">
                  {run.moves} moves · {formatTime(run.seconds)}
                </span>
                <span className="w-14 shrink-0 text-right font-display font-extrabold tabular-nums">
                  {run.score}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
