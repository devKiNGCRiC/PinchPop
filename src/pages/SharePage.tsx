import { useParams } from "react-router-dom";

import { EmptyState } from "@/components/EmptyState";
import { PopLink } from "@/components/PopButton";
import { Polaroid } from "@/components/Polaroid";
import { artName } from "@/lib/art";
import { useMemories } from "@/lib/memories";
import { formatTime } from "@/lib/puzzle";
import { tiltFor } from "@/lib/stats";

export default function SharePage() {
  const { slug } = useParams();
  const memories = useMemories();
  const memory = memories.find((m) => m.id === slug);

  return (
    <div className="mx-auto max-w-[1120px] px-5 pt-32 pb-8 sm:px-6 sm:pt-40" data-share-slug={slug}>
      <title>Shared polaroid · PinchPop</title>
      {memory ? (
        <div className="mx-auto flex max-w-[400px] flex-col items-center gap-8 text-center">
          <h1 className="sr-only">Shared polaroid</h1>
          <Polaroid
            artId={memory.artId}
            caption={artName(memory.artId)}
            tilt={tiltFor(memory.id)}
            tape
            develop
          >
            <span className="mt-1 text-sm font-semibold text-ink-soft">
              {memory.score} pts · {memory.moves} moves · {formatTime(memory.seconds)}
            </span>
          </Polaroid>
          <p className="text-base text-ink-soft">
            You can only see this print on this device. Public links arrive with accounts.
          </p>
        </div>
      ) : (
        <>
          <h1 className="sr-only">Shared polaroid</h1>
          <EmptyState
            title="This polaroid isn't on this device"
            body="Public share links launch with accounts. Until then, prints only live in the browser that made them."
          >
            <PopLink to="/game" tone="lemon" size="lg">
              Make your own
            </PopLink>
          </EmptyState>
        </>
      )}
    </div>
  );
}
