import { useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { X } from "lucide-react";

import { bannerDataUri } from "@/lib/bannerArt";
import { stickerIconDataUri } from "@/lib/stickerIcons";
import type { PlacedSticker } from "@/lib/stickers";

interface StickerLayerProps {
  stickers: PlacedSticker[];
  /** Static/display-only when false — every existing Polaroid caller that doesn't opt in gets
   * plain rendering, never drag/resize behavior. */
  editable?: boolean;
  onChange?: (next: PlacedSticker[]) => void;
}

type DragKind = "move" | "resize";

const MIN_SIZE = 0.06;
const MAX_SIZE = 0.6;

/** Renders placed stickers over a photo. In editable mode, each one can be dragged to reposition,
 * resized via its corner handle, or removed via its close button, once selected. */
export function StickerLayer({ stickers, editable = false, onChange }: StickerLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; kind: DragKind; pointerId: number } | null>(null);

  function updateSticker(id: string, patch: Partial<PlacedSticker>) {
    onChange?.(stickers.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function handlePointerDown(id: string, kind: DragKind, event: ReactPointerEvent) {
    if (!editable) return;
    event.stopPropagation();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Capture is a nice-to-have (keeps the drag going if the pointer leaves the element) — a
      // pointer id the browser won't let us capture shouldn't block selecting/dragging the sticker.
    }
    dragRef.current = { id, kind, pointerId: event.pointerId };
    setSelectedId(id);
  }

  function handlePointerMove(event: ReactPointerEvent) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const rect = containerRef.current?.getBoundingClientRect();
    const sticker = stickers.find((s) => s.id === drag.id);
    if (!rect || !sticker) return;

    if (drag.kind === "move") {
      const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
      const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
      updateSticker(drag.id, { x, y });
    } else {
      const dx = (event.clientX - rect.left) / rect.width - sticker.x;
      const dy = (event.clientY - rect.top) / rect.height - sticker.y;
      const size = Math.min(MAX_SIZE, Math.max(MIN_SIZE, Math.hypot(dx, dy) * 2));
      updateSticker(drag.id, { size });
    }
  }

  function endDrag(event: ReactPointerEvent) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }

  function removeSticker(id: string) {
    onChange?.(stickers.filter((s) => s.id !== id));
    setSelectedId(null);
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      onPointerMove={editable ? handlePointerMove : undefined}
      onPointerUp={editable ? endDrag : undefined}
      onPointerCancel={editable ? endDrag : undefined}
      onPointerDown={editable ? () => setSelectedId(null) : undefined}
    >
      {stickers.map((sticker) => {
        const selected = editable && selectedId === sticker.id;
        return (
          <div
            key={sticker.id}
            className="absolute"
            style={{
              left: `${sticker.x * 100}%`,
              top: `${sticker.y * 100}%`,
              width: `${sticker.size * 100}%`,
              aspectRatio: sticker.aspect ?? 1,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              role={editable ? "button" : undefined}
              tabIndex={editable ? 0 : undefined}
              aria-label={
                editable
                  ? `${sticker.iconId === "banner" ? "banner" : sticker.iconId} sticker — drag to move`
                  : undefined
              }
              onPointerDown={(e) => handlePointerDown(sticker.id, "move", e)}
              className="flex size-full touch-none items-center justify-center leading-none select-none"
              style={{ cursor: editable ? "grab" : undefined }}
            >
              <img
                src={
                  sticker.iconId === "banner"
                    ? bannerDataUri(sticker.text ?? "")
                    : stickerIconDataUri(sticker.iconId)
                }
                alt=""
                draggable={false}
                className="size-full object-contain"
                style={{ filter: "drop-shadow(0 3px 3px rgba(17,20,38,0.35))" }}
              />
            </div>
            {selected ? (
              <>
                <button
                  type="button"
                  aria-label="Remove sticker"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => removeSticker(sticker.id)}
                  className="pop absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full border-2 border-ink bg-sindoor text-white"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
                <span
                  role="slider"
                  aria-label="Drag to resize"
                  aria-valuenow={Math.round(sticker.size * 100)}
                  tabIndex={0}
                  onPointerDown={(e) => handlePointerDown(sticker.id, "resize", e)}
                  className="pop absolute -right-2 -bottom-2 size-5 touch-none rounded-full border-2 border-ink bg-marigold"
                  style={{ cursor: "nwse-resize" }}
                />
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
