import { useEffect, useState } from "react";

import { StickerLayer } from "@/components/StickerLayer";
import { renderQuickPolaroidCanvas } from "@/lib/export";
import type { QuickPolaroid, QuickRender } from "@/lib/export";
import type { FramePreset } from "@/lib/frames";
import type { PlacedSticker } from "@/lib/stickers";

interface PrintPreviewProps {
  /** Everything except stickers, which are edited as an overlay on top of the rendered print. */
  input: Omit<QuickPolaroid, "stickers">;
  filterCss: string;
  frame: FramePreset;
  stickers: PlacedSticker[];
  onStickersChange: (next: PlacedSticker[]) => void;
}

interface Preview {
  url: string;
  width: number;
  height: number;
  photo: QuickRender["photo"];
}

/** Shows the exact image the download produces, so what you see is what you get. Stickers are
 * drawn as a draggable overlay on the photo's own rectangle, then baked into the export. */
export function PrintPreview({
  input,
  filterCss,
  frame,
  stickers,
  onStickersChange,
}: PrintPreviewProps) {
  const [preview, setPreview] = useState<Preview | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const { canvas, photo } = await renderQuickPolaroidCanvas(
          { ...input, stickers: [] },
          filterCss,
          frame,
          false,
        );
        const blob = await new Promise<Blob>((resolve, reject) =>
          canvas.toBlob(
            (result) => (result ? resolve(result) : reject(new Error("Preview failed."))),
            "image/png",
          ),
        );
        if (cancelled) return;
        setPreview({
          url: URL.createObjectURL(blob),
          width: canvas.width,
          height: canvas.height,
          photo,
        });
      } catch (err) {
        console.warn("[PinchPop] Could not draw the preview:", err);
      }
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [input, filterCss, frame]);

  const previewUrl = preview?.url;
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!preview) {
    return <div className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-white/60" />;
  }

  const { width, height, photo } = preview;
  return (
    <div className="relative w-full">
      <img
        src={preview.url}
        alt="Your polaroid preview"
        className="block w-full select-none"
        draggable={false}
      />
      <div
        className="absolute"
        style={{
          left: `${(photo.x / width) * 100}%`,
          top: `${(photo.y / height) * 100}%`,
          width: `${(photo.w / width) * 100}%`,
          height: `${(photo.h / height) * 100}%`,
        }}
      >
        <StickerLayer stickers={stickers} editable onChange={onStickersChange} />
      </div>
    </div>
  );
}
