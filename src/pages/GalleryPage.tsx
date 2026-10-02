import { useEffect, useState } from "react";
import { Cloud, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { EmptyState } from "@/components/EmptyState";
import { PhotoStripCard } from "@/components/PhotoStripCard";
import { PopButton, PopLink } from "@/components/PopButton";
import { Seo } from "@/components/Seo";
import { Polaroid } from "@/components/Polaroid";
import { getArt, PLACE_LIST } from "@/lib/art";
import type { PlaceId } from "@/lib/art";
import { useProfile } from "@/lib/auth";
import type { Memory } from "@/lib/memories";
import { clearMemories, deleteMemory, useMemories } from "@/lib/memories";
import { formatDate, tiltFor } from "@/lib/stats";
import { cn } from "@/lib/utils";

type Sort = "newest" | "best";
type Filter = "all" | PlaceId;

/** Runs that exist in the cloud but not on this device — solved on a different one, or re-synced
 * after this device's local copy was cleared. Resolved as Memory-shaped objects (photo becomes a
 * signed thumbnail URL) so they render through the exact same grid as local ones. */
function useCloudOnlyMemories(localMemories: Memory[]): Memory[] {
  const { session } = useProfile();
  const userId = session?.user.id ?? null;
  // Keyed to whichever user it was fetched for, so a stale result from a previous identity can
  // never leak through — the ternary below masks it the instant `userId` changes, with no need
  // to reset this state from inside the effect (same pattern as useProfile() in auth.ts).
  const [fetched, setFetched] = useState<{ userId: string; memories: Memory[] } | null>(null);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    const localIds = new Set(localMemories.map((m) => m.id));

    import("@/lib/cloudRuns").then(async ({ fetchMyCloudRuns, signedPhotoUrl }) => {
      const runs = await fetchMyCloudRuns(userId).catch((error: unknown) => {
        console.warn("[PinchPop] Could not load cloud runs for the album:", error);
        return [];
      });
      if (!active) return;

      const missing = runs.filter((run) => !run.localId || !localIds.has(run.localId));
      const resolved = await Promise.all(
        missing.map(async (run) => {
          const photo = run.photoPath
            ? await signedPhotoUrl(run.photoPath, { width: 400, height: 400 })
            : null;
          const memory: Memory = {
            id: run.id,
            artId: run.artId,
            moves: run.moves,
            seconds: run.seconds,
            score: run.score,
            createdAt: run.createdAt,
            ...(run.accuracy !== null ? { accuracy: run.accuracy } : {}),
            ...(photo ? { photo, aspect: run.aspect ?? undefined } : {}),
          };
          return memory;
        }),
      );
      if (active) setFetched({ userId, memories: resolved });
    });

    return () => {
      active = false;
    };
    // localMemories is intentionally not in the dependency array: it changes on every local
    // write (including ones this hook itself doesn't care about, like caption edits), and this
    // only needs to re-run when the signed-in identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return userId && fetched?.userId === userId ? fetched.memories : [];
}

export default function GalleryPage() {
  const memories = useMemories();
  const cloudOnly = useCloudOnlyMemories(memories);
  const allMemories = [...memories, ...cloudOnly].sort((a, b) => b.createdAt - a.createdAt);
  const cloudIds = new Set(cloudOnly.map((m) => m.id));
  const [sort, setSort] = useState<Sort>("newest");
  const [filter, setFilter] = useState<Filter>("all");
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered =
    filter === "all" ? allMemories : allMemories.filter((m) => getArt(m.artId).id === filter);
  const shown = sort === "best" ? [...filtered].sort((a, b) => b.score - a.score) : filtered;

  return (
    <div className="mx-auto max-w-280 px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      <Seo
        title="Album"
        description="Your saved polaroids and photo strip, kept on this device."
        path="/gallery"
        noIndex
      />
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-[clamp(32px,6vw,64px)] leading-[0.95] font-extrabold tracking-[-0.05em]">
            Your album
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
            {allMemories.length === 0 ? (
              "Nothing pinned yet."
            ) : (
              <>
                {allMemories.length} polaroid{allMemories.length === 1 ? "" : "s"}
                {cloudOnly.length > 0 ? (
                  <>
                    {" "}
                    <span className="inline-flex items-center gap-1 align-middle text-chakra">
                      <Cloud className="size-4" aria-hidden="true" />
                      {cloudOnly.length} from other devices
                    </span>
                  </>
                ) : (
                  ", saved on this device."
                )}
              </>
            )}
          </p>
        </div>

        {allMemories.length > 0 ? (
          <div className="flex flex-wrap items-center gap-3">
            <div
              role="group"
              aria-label="Sort polaroids"
              className="sticker flex rounded-full bg-cloud p-1"
            >
              {(["newest", "best"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={sort === option}
                  onClick={() => setSort(option)}
                  className={cn(
                    "h-10 rounded-full px-4 text-[15px] font-semibold transition-colors",
                    sort === option ? "bg-chakra text-white" : "hover:bg-marigold/40",
                  )}
                >
                  {option === "newest" ? "Newest" : "Best score"}
                </button>
              ))}
            </div>
            {confirmClear ? (
              <>
                <PopButton
                  tone="coral"
                  size="sm"
                  onClick={() => {
                    clearMemories();
                    setConfirmClear(false);
                  }}
                >
                  Yes, clear this device's
                </PopButton>
                <PopButton tone="white" size="sm" onClick={() => setConfirmClear(false)}>
                  Keep them
                </PopButton>
              </>
            ) : (
              <PopButton tone="white" size="sm" onClick={() => setConfirmClear(true)}>
                Clear all
              </PopButton>
            )}
          </div>
        ) : null}
      </div>

      <PhotoStripCard memories={allMemories} />

      {allMemories.length > 0 ? (
        <div
          role="group"
          aria-label="Filter by destination"
          className="mt-8 flex flex-wrap gap-2.5"
        >
          {[{ id: "all" as const, place: "All places", swatch: "bg-white" }, ...PLACE_LIST].map(
            (option) => {
              const count =
                option.id === "all"
                  ? allMemories.length
                  : allMemories.filter((m) => getArt(m.artId).id === option.id).length;
              return (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={filter === option.id}
                  onClick={() => setFilter(option.id)}
                  className={cn(
                    "pop sticker inline-flex h-11 items-center gap-2 rounded-full px-4 text-[15px] font-semibold",
                    filter === option.id ? "bg-marigold" : "bg-white",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn("size-3 rounded-full border-2 border-ink", option.swatch)}
                  />
                  {option.place}
                  <span className="text-ink-soft">{count}</span>
                </button>
              );
            },
          )}
        </div>
      ) : null}

      {allMemories.length === 0 ? (
        <div className="mt-16">
          <EmptyState
            title="Your album is empty"
            body="Every puzzle you solve pins a polaroid here, postmarked with the place you solved."
          >
            <PopLink to="/game" tone="saffron" size="lg">
              Solve your first puzzle
            </PopLink>
          </EmptyState>
        </div>
      ) : shown.length === 0 ? (
        <p className="mt-14 text-lg text-ink-soft">
          No polaroids from this destination yet.{" "}
          <Link
            to={filter === "camera" ? "/camera" : `/game?art=${filter}`}
            className="font-semibold text-chakra underline"
          >
            Solve one
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((memory, i) => {
            const art = getArt(memory.artId);
            const isCloudOnly = cloudIds.has(memory.id);
            return (
              <li key={memory.id} className="relative mx-auto w-full max-w-85">
                <Link
                  to={`/results?m=${memory.id}`}
                  aria-label={`Open ${art.name} polaroid, ${memory.score} points`}
                  className="group block transition-transform duration-200 hover:-translate-y-1.5 hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:transform-none"
                >
                  <Polaroid
                    artId={memory.artId}
                    photo={memory.photo}
                    aspect={memory.aspect}
                    caption={memory.caption ?? art.caption}
                    tilt={tiltFor(memory.id)}
                    tape={i % 3 === 0}
                  >
                    <span className="mt-1 text-sm font-semibold text-ink-soft">
                      {memory.score} pts · {memory.moves} moves · {formatDate(memory.createdAt)}
                    </span>
                  </Polaroid>
                </Link>
                {isCloudOnly ? (
                  <span
                    aria-label="Synced from another device"
                    title="Synced from another device"
                    className="pop sticker absolute -top-3 -right-2 z-10 flex size-11 items-center justify-center rounded-full bg-chakra text-white"
                  >
                    <Cloud className="size-5" aria-hidden="true" />
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-label={`Delete ${art.name} polaroid`}
                    onClick={() => deleteMemory(memory.id)}
                    className="pop sticker absolute -top-3 -right-2 z-10 flex size-11 items-center justify-center rounded-full bg-cloud"
                  >
                    <Trash2 className="size-5 text-sindoor" aria-hidden="true" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
