import { useEffect, useState } from "react";
import { User } from "lucide-react";
import { useParams } from "react-router-dom";

import { Chakra } from "@/components/Chakra";
import { EmptyState } from "@/components/EmptyState";
import { PopLink } from "@/components/PopButton";
import { Seo } from "@/components/Seo";
import { avatarUrl } from "@/lib/avatar";
import { fetchPublicPlayer } from "@/lib/players";
import type { PublicPlayer } from "@/lib/players";
import { cn } from "@/lib/utils";

type Status = "ready" | "not-found" | "error";

interface Loaded {
  username: string;
  status: Status;
  player: PublicPlayer | null;
}

export default function PlayerPage() {
  const { username = "" } = useParams();
  // Keyed to whichever username it was fetched for, so switching between two player pages shows
  // a loading state instead of briefly flashing the previous player's data — with no need to
  // reset this state from inside the effect (see memories.ts's useProfile for the same pattern).
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let active = true;
    fetchPublicPlayer(username)
      .then((result) => {
        if (active) setLoaded({ username, status: result ? "ready" : "not-found", player: result });
      })
      .catch((error: unknown) => {
        console.warn("[PinchPop] Could not load that player:", error);
        if (active) setLoaded({ username, status: "error", player: null });
      });
    return () => {
      active = false;
    };
  }, [username]);

  const current = loaded?.username === username ? loaded : null;

  if (!current) {
    return (
      <div className="mx-auto max-w-280 px-5 pt-32 pb-8 text-center sm:px-6 sm:pt-40">
        <Seo
          title="Player"
          description="A PinchPop player's public profile."
          path={`/players/${username}`}
          noIndex
        />
        <h1 className="sr-only">Loading player</h1>
        <Chakra spokes={24} className="mx-auto size-12 animate-spin text-chakra" />
      </div>
    );
  }

  const { status, player } = current;
  if (status !== "ready" || !player) {
    return (
      <div className="mx-auto max-w-280 px-5 pt-32 pb-8 sm:px-6 sm:pt-40">
        <Seo
          title="Player not found"
          description="This PinchPop player could not be found."
          path={`/players/${username}`}
          noIndex
        />
        <h1 className="sr-only">Player not found</h1>
        <EmptyState
          title={status === "error" ? "Could not load this player" : "No player with that name"}
          body={
            status === "error"
              ? "Something went wrong loading this profile. Try again shortly."
              : "They may have deleted their account, or the link is mistyped."
          }
        >
          <PopLink to="/leaderboard" tone="saffron" size="lg">
            Back to leaderboard
          </PopLink>
        </EmptyState>
      </div>
    );
  }

  const avatar = avatarUrl(player.avatarPath);
  const tiles = [
    {
      label: "Best score",
      value: player.bestScore === null ? "–" : String(player.bestScore),
      color: "bg-marigold text-ink",
    },
    { label: "Puzzles solved", value: String(player.totalSolves), color: "bg-saffron text-ink" },
    {
      label: "Destinations",
      value: `${player.destinationsVisited} of 4`,
      color: "bg-leaf text-white",
    },
  ];

  return (
    <div className="mx-auto max-w-280 px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      <Seo
        title={player.username}
        description={player.bio ?? `${player.username}'s PinchPop player profile.`}
        path={`/players/${player.username}`}
        noIndex
      />
      <div className="mx-auto max-w-xl text-center">
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="pop sticker mx-auto size-28 rounded-full border-[2.5px] border-ink object-cover"
          />
        ) : (
          <span className="pop sticker mx-auto flex size-28 items-center justify-center rounded-full border-[2.5px] border-ink bg-leaf text-white">
            <User className="size-12" aria-hidden="true" />
          </span>
        )}
        <h1 className="mt-5 font-display text-[clamp(28px,5vw,48px)] font-extrabold tracking-tight">
          {player.username}
        </h1>
        {player.bio ? (
          <p className="mt-3 text-lg leading-relaxed text-ink-soft">{player.bio}</p>
        ) : null}
      </div>

      <dl className="mx-auto mt-10 grid max-w-xl grid-cols-3 gap-4">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className={cn("sticker-lg rounded-3xl p-4 text-center", tile.color)}
          >
            <dt className="text-sm font-semibold">{tile.label}</dt>
            <dd className="mt-1 font-display text-2xl font-extrabold tabular-nums">{tile.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-10 flex justify-center">
        <PopLink to="/leaderboard" tone="white" size="lg">
          Back to leaderboard
        </PopLink>
      </div>
    </div>
  );
}
