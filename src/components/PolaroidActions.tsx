import { useState } from "react";
import { Download, Share2 } from "lucide-react";

import { PopButton } from "@/components/PopButton";
import { getArt } from "@/lib/art";
import { downloadBlob, renderPolaroidBlob, shareOrDownload } from "@/lib/export";
import { DEFAULT_FILTER_ID, filterCssFor } from "@/lib/filters";
import { DEFAULT_FRAME_ID, frameFor } from "@/lib/frames";
import type { Memory } from "@/lib/memories";
import { INSTAGRAM_LINK } from "@/lib/social";
import type { PlacedSticker } from "@/lib/stickers";

interface PolaroidActionsProps {
  memory: Memory;
  /** The chosen filter preset id, baked into the exported image. Defaults to no filter for
   * callers (like the share page) that don't offer a picker. */
  filterId?: string;
  frameId?: string;
  stickers?: PlacedSticker[];
}

type Busy = "download" | "share" | null;

/** Save the polaroid as an image, or send it through the device's share sheet (SHARE-04, SHARE-05). */
export function PolaroidActions({
  memory,
  filterId = DEFAULT_FILTER_ID,
  frameId = DEFAULT_FRAME_ID,
  stickers = [],
}: PolaroidActionsProps) {
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState("");
  const filename = `pinchpop-${getArt(memory.artId).id}-${memory.id}.png`;

  async function run(kind: Exclude<Busy, null>) {
    setBusy(kind);
    setMessage("");
    try {
      const blob = await renderPolaroidBlob(
        memory,
        filterCssFor(filterId),
        frameFor(frameId),
        stickers,
      );
      if (kind === "download") {
        downloadBlob(blob, filename);
        setMessage("Image saved to your downloads.");
      } else {
        const outcome = await shareOrDownload(blob, filename, "My PinchPop polaroid");
        if (outcome === "downloaded") {
          setMessage("Sharing is not available here, so the image was saved to your downloads.");
        } else if (outcome === "shared") {
          setMessage("Shared.");
        }
      }
    } catch (error) {
      console.warn("[PinchPop] Could not export the polaroid:", error);
      setMessage("Sorry, the image could not be created. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <PopButton onClick={() => void run("download")} disabled={busy !== null} tone="marigold">
          <Download className="size-5" aria-hidden="true" />
          {busy === "download" ? "Making image…" : "Download image"}
        </PopButton>
        <PopButton onClick={() => void run("share")} disabled={busy !== null} tone="coral">
          <Share2 className="size-5" aria-hidden="true" />
          {busy === "share" ? "Opening…" : "Share"}
        </PopButton>
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-sm text-ink-soft">
        <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor" aria-hidden="true">
          <path d={INSTAGRAM_LINK.path} />
        </svg>
        On your phone, "Share" opens your photo app picker — pick Instagram, WhatsApp or any app you
        have installed and post it from there.
      </p>
      <p aria-live="polite" className="mt-2 min-h-6 text-base text-ink-soft">
        {message}
      </p>
    </div>
  );
}
