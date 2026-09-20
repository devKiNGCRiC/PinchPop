import { useParams } from "react-router-dom";

import { EmptyState } from "@/components/EmptyState";
import { PopLink } from "@/components/PopButton";
import { Polaroid } from "@/components/Polaroid";
import { getArt } from "@/lib/art";
import { useMemories } from "@/lib/memories";
import { formatTime } from "@/lib/puzzle";
import { postmarkDate, tiltFor } from "@/lib/stats";

export default function SharePage() {
  const { slug } = useParams();
  const memories = useMemories();
  const memory = memories.find((m) => m.id === slug);
  const art = memory ? getArt(memory.artId) : null;

  return (
    <div className="mx-auto max-w-280 px-5 pt-32 pb-8 sm:px-6 sm:pt-40" data-share-slug={slug}>
      <title>Shared polaroid · PinchPop</title>
      {memory && art ? (
        <div className="mx-auto flex max-w-100 flex-col items-center gap-8 text-center">
          <h1 className="sr-only">Shared polaroid</h1>
          <Polaroid
            artId={memory.artId}
            photo={memory.photo}
            aspect={memory.aspect}
            caption={art.caption}
            tilt={tiltFor(memory.id)}
            tape
            develop
            postmark={{ place: art.place, date: postmarkDate(memory.createdAt) }}
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
            title="This polaroid is not on this device"
            body="Public share links launch with accounts. Until then, prints only live in the browser that made them."
          >
            <PopLink to="/game" tone="saffron" size="lg">
              Make your own
            </PopLink>
          </EmptyState>
        </>
      )}
    </div>
  );
}
