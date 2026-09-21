import { useState } from "react";
import { Download } from "lucide-react";

import { PopButton } from "@/components/PopButton";
import { downloadBlob, renderStripBlob } from "@/lib/export";
import type { Memory } from "@/lib/memories";
import { formatDate } from "@/lib/stats";

interface PhotoStripCardProps {
  memories: Memory[];
}

/** Your three latest camera photos as a photobooth strip, ready to download (GAME-07). */
export function PhotoStripCard({ memories }: PhotoStripCardProps) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const shots = memories
    .filter((m) => m.photo)
    .sort((a, b) => a.createdAt - b.createdAt)
    .slice(-3);
  if (shots.length === 0) return null;

  async function download() {
    setBusy(true);
    setMessage("");
    try {
      downloadBlob(await renderStripBlob(shots), "pinchpop-photo-strip.png");
      setMessage("Strip saved to your downloads.");
    } catch (error) {
      console.warn("[PinchPop] Could not export the photo strip:", error);
      setMessage("Sorry, the strip could not be created. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby="strip-heading"
      className="sticker-lg mt-12 grid items-center gap-8 rounded-3xl bg-white p-6 sm:grid-cols-[auto_1fr]"
    >
      <ul
        aria-label="Photo strip preview"
        className="mx-auto flex w-32 flex-col gap-2 rounded-lg border-[2.5px] border-ink bg-cloud p-2 shadow-pop-sm"
      >
        {shots.map((shot) => (
          <li key={shot.id}>
            <img
              src={shot.photo}
              alt={`Camera photo from ${formatDate(shot.createdAt)}`}
              className="block aspect-[4/3] w-full border-2 border-ink object-cover"
            />
          </li>
        ))}
        <li className="pt-1 text-center font-display text-[10px] font-extrabold tracking-tight">
          PinchPop
        </li>
      </ul>
      <div>
        <h2
          id="strip-heading"
          className="font-display text-2xl leading-tight font-extrabold tracking-[-0.04em]"
        >
          Your photo strip
        </h2>
        <p className="mt-2 max-w-md text-lg leading-snug text-ink-soft">
          Your latest {shots.length === 1 ? "camera photo" : `${shots.length} camera photos`}, laid
          out like a photobooth strip. Take up to three to fill it.
        </p>
        <div className="mt-4">
          <PopButton onClick={() => void download()} disabled={busy} tone="marigold">
            <Download className="size-5" aria-hidden="true" />
            {busy ? "Making strip…" : "Download strip"}
          </PopButton>
        </div>
        <p aria-live="polite" className="mt-3 min-h-6 text-base text-ink-soft">
          {message}
        </p>
      </div>
    </section>
  );
}
