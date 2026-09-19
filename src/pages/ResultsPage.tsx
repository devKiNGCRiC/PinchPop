import { Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Confetti } from "@/components/Confetti";
import { EmptyState } from "@/components/EmptyState";
import { PopButton, PopLink } from "@/components/PopButton";
import { Polaroid } from "@/components/Polaroid";
import { artName } from "@/lib/art";
import { deleteMemory, useMemories } from "@/lib/memories";
import { formatTime } from "@/lib/puzzle";
import { formatDate, tiltFor } from "@/lib/stats";

export default function ResultsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const memories = useMemories();
  const requested = params.get("m");
  const memory = memories.find((m) => m.id === requested) ?? memories[0];

  if (!memory) {
    return (
      <div className="mx-auto max-w-[1120px] px-5 pt-32 pb-8 sm:px-6 sm:pt-40">
        <title>Results · PinchPop</title>
        <h1 className="sr-only">Results</h1>
        <EmptyState
          title="No polaroid yet"
          body="Solve a puzzle and your print shows up here with your score."
        >
          <PopLink to="/game" tone="lemon" size="lg">
            Solve a puzzle
          </PopLink>
        </EmptyState>
      </div>
    );
  }

  const isBest = memories.length > 1 && memories.every((m) => m.score <= memory.score);

  return (
    <div className="mx-auto max-w-[1120px] px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      <title>Your polaroid · PinchPop</title>
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative mx-auto w-full max-w-[400px] py-4">
          <Confetti key={memory.id} />
          <Polaroid
            artId={memory.artId}
            caption={artName(memory.artId)}
            tilt={tiltFor(memory.id) || 3}
            tape
            develop
          >
            <span className="mt-1 text-sm font-semibold text-ink-soft">
              {formatDate(memory.createdAt)}
            </span>
          </Polaroid>
        </div>

        <div>
          <h1 className="font-display text-[clamp(36px,7vw,84px)] leading-[0.92] font-extrabold tracking-[-0.055em]">
            Nailed it.
          </h1>
          {isBest ? (
            <p className="sticker mt-4 inline-block -rotate-2 rounded-full bg-mint px-4 py-1.5 text-base font-semibold">
              New personal best
            </p>
          ) : null}

          <dl className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            <Tile label="Score" value={String(memory.score)} color="bg-lemon" />
            <Tile label="Moves" value={String(memory.moves)} color="bg-bubble" />
            <Tile label="Time" value={formatTime(memory.seconds)} color="bg-mint" />
          </dl>

          <div className="mt-9 flex flex-wrap gap-3">
            <PopLink to="/game" tone="ultra" size="lg">
              Play again
            </PopLink>
            <PopLink to="/gallery" tone="white" size="lg">
              Open gallery
            </PopLink>
            <PopButton
              tone="white"
              size="lg"
              aria-label="Delete this polaroid"
              onClick={() => {
                deleteMemory(memory.id);
                navigate("/gallery");
              }}
            >
              <Trash2 className="size-5 text-danger" aria-hidden="true" />
              Delete
            </PopButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`sticker-lg rounded-3xl p-4 sm:p-5 ${color}`}>
      <dt className="text-sm font-semibold">{label}</dt>
      <dd className="mt-1 font-display text-[clamp(24px,4vw,40px)] leading-none font-extrabold tracking-[-0.05em] tabular-nums">
        {value}
      </dd>
    </div>
  );
}
