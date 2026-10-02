import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Chakra } from "@/components/Chakra";
import { EmptyState } from "@/components/EmptyState";
import { PolaroidActions } from "@/components/PolaroidActions";
import { PopLink } from "@/components/PopButton";
import { Seo } from "@/components/Seo";
import { Polaroid } from "@/components/Polaroid";
import { getArt } from "@/lib/art";
import { useMemories } from "@/lib/memories";
import type { Memory } from "@/lib/memories";
import { formatTime } from "@/lib/puzzle";
import { postmarkDate, tiltFor } from "@/lib/stats";

/** A share link viewed on a device other than the one that made the print has no local copy to
 * fall back on, so it fetches the owner's public run from the cloud instead. Resolves to null
 * (not found) for a private run or an unknown username/id — same whether that's because the link
 * is wrong or because the owner never made it public. */
function usePublicRun(
  username: string | undefined,
  localId: string | undefined,
  foundLocally: boolean,
) {
  const [loaded, setLoaded] = useState<{ key: string; memory: Memory | null } | null>(null);
  const key = username && localId ? `${username}/${localId}` : null;

  useEffect(() => {
    if (!key || foundLocally || !username || !localId) return;
    let active = true;
    import("@/lib/cloudRuns").then(({ fetchPublicRun }) =>
      fetchPublicRun(username, localId)
        .then((memory) => {
          if (active) setLoaded({ key, memory });
        })
        .catch((error: unknown) => {
          console.warn("[PinchPop] Could not load that shared photo:", error);
          if (active) setLoaded({ key, memory: null });
        }),
    );
    return () => {
      active = false;
    };
  }, [key, username, localId, foundLocally]);

  if (!key || foundLocally) return { memory: null, loading: false };
  const current = loaded?.key === key ? loaded : null;
  return { memory: current?.memory ?? null, loading: !current };
}

export default function SharePage() {
  const { username, localId } = useParams();
  const memories = useMemories();
  const localMemory = localId ? memories.find((m) => m.id === localId) : undefined;
  const publicRun = usePublicRun(username, localId, !!localMemory);
  const memory = localMemory ?? publicRun.memory ?? undefined;
  const art = memory ? getArt(memory.artId) : null;

  if (!memory || !art) {
    if (publicRun.loading) {
      return (
        <div className="mx-auto max-w-280 px-5 pt-32 pb-8 text-center sm:px-6 sm:pt-40">
          <Seo
            title="Shared polaroid"
            description="A polaroid shared from PinchPop."
            path="/share"
            noIndex
          />
          <h1 className="sr-only">Loading</h1>
          <Chakra spokes={24} className="mx-auto size-12 animate-spin text-chakra" />
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-280 px-5 pt-32 pb-8 sm:px-6 sm:pt-40">
        <Seo
          title="Shared polaroid"
          description="A polaroid shared from PinchPop."
          path="/share"
          noIndex
        />
        <h1 className="sr-only">Shared polaroid</h1>
        <EmptyState
          title="This polaroid isn't public"
          body="Either this link is wrong, or the player hasn't made this photo public yet."
        >
          <PopLink to="/game" tone="saffron" size="lg">
            Make your own
          </PopLink>
        </EmptyState>
      </div>
    );
  }

  return (
    <div
      className="mx-auto max-w-280 px-5 pt-32 pb-8 sm:px-6 sm:pt-40"
      data-share-slug={`${username}/${localId}`}
    >
      <Seo
        title={`${art.place} polaroid`}
        description={`A polaroid from ${art.place}, shared from PinchPop.`}
        path="/share"
        noIndex
      />
      <div className="mx-auto flex max-w-100 flex-col items-center gap-8 text-center">
        <h1 className="sr-only">Shared polaroid</h1>
        <Polaroid
          artId={memory.artId}
          photo={memory.photo}
          aspect={memory.aspect}
          caption={memory.caption ?? art.caption}
          tilt={tiltFor(memory.id)}
          tape
          develop
          postmark={{ place: art.place, date: postmarkDate(memory.createdAt) }}
        >
          <span className="mt-1 text-sm font-semibold text-ink-soft">
            {memory.score} pts · {memory.moves} moves · {formatTime(memory.seconds)}
          </span>
        </Polaroid>
        <PolaroidActions memory={memory} />
      </div>
    </div>
  );
}
