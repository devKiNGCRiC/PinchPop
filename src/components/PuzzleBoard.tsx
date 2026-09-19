import { useState, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Check } from "lucide-react";

import { ArtTile } from "@/components/Art";
import { cn } from "@/lib/utils";

interface PuzzleBoardProps {
  artId: string;
  order: number[];
  solved: boolean;
  onSwap: (a: number, b: number) => void;
  className?: string;
}

interface DragState {
  index: number;
  dx: number;
  dy: number;
}

const DRAG_THRESHOLD_PX = 6;

/**
 * A 3×3 swap puzzle. Drag a tile onto another to swap them, or tap one tile then another.
 * Keyboard: Tab to a tile, Enter/Space to pick it up, then Enter/Space on the tile to swap with.
 */
export function PuzzleBoard({ artId, order, solved, onSwap, className }: PuzzleBoardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const press = useRef<{ index: number; x: number; y: number; moved: boolean } | null>(null);

  function tap(index: number) {
    if (selected === null) {
      setSelected(index);
    } else if (selected === index) {
      setSelected(null);
    } else {
      onSwap(selected, index);
      setSelected(null);
    }
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLButtonElement>, index: number) {
    if (solved || (event.pointerType === "mouse" && event.button !== 0)) return;
    press.current = { index, x: event.clientX, y: event.clientY, moved: false };

    const onMove = (move: PointerEvent) => {
      const current = press.current;
      if (!current) return;
      const dx = move.clientX - current.x;
      const dy = move.clientY - current.y;
      if (!current.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) current.moved = true;
      if (current.moved) setDrag({ index: current.index, dx, dy });
    };

    const onUp = (up: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      const current = press.current;
      press.current = null;
      if (!current) return;

      if (!current.moved) {
        tap(current.index);
        return;
      }
      // The dragged tile is pointer-events-none while dragging, so this finds the tile beneath it.
      const under = document
        .elementFromPoint(up.clientX, up.clientY)
        ?.closest<HTMLElement>("[data-tile-index]");
      const target = under ? Number(under.dataset.tileIndex) : NaN;
      setDrag(null);
      setSelected(null);
      if (!Number.isNaN(target) && target !== current.index) onSwap(current.index, target);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  }

  return (
    <div className={cn("sticker rounded-3xl bg-cloud p-2 sm:p-3", className)}>
      <div
        className={cn(
          "grid aspect-square grid-cols-3 grid-rows-3 touch-none transition-[gap] duration-500 select-none",
          solved ? "gap-0 overflow-hidden rounded-2xl" : "gap-1.5 sm:gap-2",
        )}
      >
        {order.map((tile, position) => {
          const placed = tile === position;
          const isDragging = drag?.index === position;
          const isSelected = selected === position;
          return (
            <button
              key={tile}
              type="button"
              data-tile-index={position}
              data-tile={tile}
              disabled={solved}
              aria-pressed={isSelected}
              aria-label={`Tile ${position + 1} of 9${placed ? ", in the right place" : ""}`}
              onPointerDown={(event) => handlePointerDown(event, position)}
              onClick={(event) => {
                // Mouse and touch taps are handled on pointer-up; detail === 0 is a keyboard click.
                if (event.detail === 0) tap(position);
              }}
              style={
                isDragging ? { transform: `translate(${drag.dx}px, ${drag.dy}px)` } : undefined
              }
              className={cn(
                "relative touch-none overflow-hidden border-[2.5px] border-ink bg-cloud p-0 disabled:opacity-100",
                solved ? "rounded-none border-0 bg-transparent" : "cursor-grab rounded-xl",
                isSelected && "z-10 scale-[0.94] ring-4 ring-lemon",
                isDragging && "pointer-events-none z-20 scale-105 cursor-grabbing shadow-pop-lg",
                !isDragging && "transition-transform duration-150",
              )}
            >
              <ArtTile artId={artId} tile={tile} className="size-full" />
              {placed && !solved ? (
                <span className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full border-2 border-ink bg-mint">
                  <Check className="size-3 text-ink" strokeWidth={4} aria-hidden="true" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
