import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { EmptyState } from "@/components/EmptyState";
import { PhotoStripCard } from "@/components/PhotoStripCard";
import { PopButton, PopLink } from "@/components/PopButton";
import { Seo } from "@/components/Seo";
import { Polaroid } from "@/components/Polaroid";
import { getArt, PLACE_LIST } from "@/lib/art";
import type { PlaceId } from "@/lib/art";
import { clearMemories, deleteMemory, useMemories } from "@/lib/memories";
import { formatDate, tiltFor } from "@/lib/stats";
import { cn } from "@/lib/utils";

type Sort = "newest" | "best";
type Filter = "all" | PlaceId;

export default function GalleryPage() {
  const memories = useMemories();
  const [sort, setSort] = useState<Sort>("newest");
  const [filter, setFilter] = useState<Filter>("all");
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered =
    filter === "all" ? memories : memories.filter((m) => getArt(m.artId).id === filter);
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
            {memories.length === 0
              ? "Nothing pinned yet."
              : `${memories.length} polaroid${memories.length === 1 ? "" : "s"}, saved on this device.`}
          </p>
        </div>

        {memories.length > 0 ? (
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
                  Yes, clear all
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

      <PhotoStripCard memories={memories} />

      {memories.length > 0 ? (
        <div
          role="group"
          aria-label="Filter by destination"
          className="mt-8 flex flex-wrap gap-2.5"
        >
          {[{ id: "all" as const, place: "All places", swatch: "bg-white" }, ...PLACE_LIST].map(
            (option) => {
              const count =
                option.id === "all"
                  ? memories.length
                  : memories.filter((m) => getArt(m.artId).id === option.id).length;
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

      {memories.length === 0 ? (
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
                    caption={art.caption}
                    tilt={tiltFor(memory.id)}
                    tape={i % 3 === 0}
                  >
                    <span className="mt-1 text-sm font-semibold text-ink-soft">
                      {memory.score} pts · {memory.moves} moves · {formatDate(memory.createdAt)}
                    </span>
                  </Polaroid>
                </Link>
                <button
                  type="button"
                  aria-label={`Delete ${art.name} polaroid`}
                  onClick={() => deleteMemory(memory.id)}
                  className="pop sticker absolute -top-3 -right-2 z-10 flex size-11 items-center justify-center rounded-full bg-cloud"
                >
                  <Trash2 className="size-5 text-sindoor" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
