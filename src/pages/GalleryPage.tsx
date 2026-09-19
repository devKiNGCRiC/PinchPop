import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import { EmptyState } from "@/components/EmptyState";
import { PopButton, PopLink } from "@/components/PopButton";
import { Polaroid } from "@/components/Polaroid";
import { artName } from "@/lib/art";
import { clearMemories, deleteMemory, useMemories } from "@/lib/memories";
import { formatDate, tiltFor } from "@/lib/stats";
import { cn } from "@/lib/utils";

type Sort = "newest" | "best";

export default function GalleryPage() {
  const memories = useMemories();
  const [sort, setSort] = useState<Sort>("newest");
  const [confirmClear, setConfirmClear] = useState(false);

  const sorted = sort === "best" ? [...memories].sort((a, b) => b.score - a.score) : memories;

  return (
    <div className="mx-auto max-w-[1120px] px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      <title>Gallery · PinchPop</title>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="font-display text-[clamp(32px,6vw,64px)] leading-[0.95] font-extrabold tracking-[-0.05em]">
            Your wall
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
                    sort === option ? "bg-lemon" : "hover:bg-lilac",
                  )}
                >
                  {option === "newest" ? "Newest" : "Best score"}
                </button>
              ))}
            </div>
            {confirmClear ? (
              <>
                <PopButton
                  tone="pink"
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

      {memories.length === 0 ? (
        <div className="mt-16">
          <EmptyState
            title="Your wall is blank"
            body="Every puzzle you solve pins a polaroid here. Go get your first one."
          >
            <PopLink to="/game" tone="lemon" size="lg">
              Solve your first puzzle
            </PopLink>
          </EmptyState>
        </div>
      ) : (
        <ul className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((memory, i) => (
            <li key={memory.id} className="relative mx-auto w-full max-w-[340px]">
              <Link
                to={`/results?m=${memory.id}`}
                aria-label={`Open ${artName(memory.artId)} polaroid, ${memory.score} points`}
                className="group block transition-transform duration-200 hover:-translate-y-1.5 hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:transform-none"
              >
                <Polaroid
                  artId={memory.artId}
                  caption={artName(memory.artId)}
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
                aria-label={`Delete ${artName(memory.artId)} polaroid`}
                onClick={() => deleteMemory(memory.id)}
                className="pop sticker absolute -top-3 -right-2 z-10 flex size-11 items-center justify-center rounded-full bg-cloud"
              >
                <Trash2 className="size-5 text-danger" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
