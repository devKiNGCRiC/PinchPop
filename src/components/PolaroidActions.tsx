import { useState } from "react";
import { Download, Share2 } from "lucide-react";

import { PopButton } from "@/components/PopButton";
import { getArt } from "@/lib/art";
import { downloadBlob, renderPolaroidBlob, shareOrDownload } from "@/lib/export";
import type { Memory } from "@/lib/memories";

interface PolaroidActionsProps {
  memory: Memory;
}

type Busy = "download" | "share" | null;

/** Save the polaroid as an image, or send it through the device's share sheet (SHARE-04, SHARE-05). */
export function PolaroidActions({ memory }: PolaroidActionsProps) {
  const [busy, setBusy] = useState<Busy>(null);
  const [message, setMessage] = useState("");
  const filename = `pinchpop-${getArt(memory.artId).id}-${memory.id}.png`;

  async function run(kind: Exclude<Busy, null>) {
    setBusy(kind);
    setMessage("");
    try {
      const blob = await renderPolaroidBlob(memory);
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
      <p aria-live="polite" className="mt-3 min-h-6 text-base text-ink-soft">
        {message}
      </p>
    </div>
  );
}
