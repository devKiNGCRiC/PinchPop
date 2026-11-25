import { useEffect, useState } from "react";

import { memoryPhotoUrl, renderQuickPolaroidCanvas } from "@/lib/export";
import { frameFor } from "@/lib/frames";

/** A finished example print, drawn by the same renderer as real downloads, so the empty maker page
 * shows what you'll get instead of a blank box. */
export function SamplePrint() {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    (async () => {
      const photo = await memoryPhotoUrl({
        id: "sample",
        artId: "kerala",
        moves: 0,
        seconds: 0,
        score: 0,
        createdAt: 0,
      });
      const { canvas } = await renderQuickPolaroidCanvas(
        { photo, aspect: 1, caption: "slow boat, Kerala", stickers: [] },
        "none",
        frameFor("notebook"),
      );
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!active || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    })().catch((error: unknown) =>
      console.warn("[PinchPop] Could not draw the sample print:", error),
    );
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-90 -rotate-2">
      {url ? (
        <img src={url} alt="An example polaroid made with PinchPop" className="block w-full" />
      ) : (
        <div className="aspect-4/5 w-full animate-pulse rounded-2xl bg-white/60" />
      )}
      <span className="sticker absolute -top-3 -right-2 rotate-6 rounded-full bg-marigold px-3 py-1 text-sm font-semibold text-ink">
        Example
      </span>
    </div>
  );
}
