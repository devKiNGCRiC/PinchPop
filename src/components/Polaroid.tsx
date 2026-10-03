import type { CSSProperties, ReactNode } from "react";

import { Art } from "@/components/Art";
import { StickerLayer } from "@/components/StickerLayer";
import { Postmark } from "@/components/Stamp";
import { DEFAULT_FRAME_ID, frameFor } from "@/lib/frames";
import { patternDataUri, PATTERN_TILE_SIZE } from "@/lib/framePatterns";
import type { PlacedSticker } from "@/lib/stickers";
import { cn } from "@/lib/utils";

interface PolaroidProps {
  artId: string;
  /** A photo taken in camera mode. When present it is shown instead of the illustration. */
  photo?: string;
  /** Width divided by height of `photo`. */
  aspect?: number;
  caption: string;
  /** Resting rotation in degrees. */
  tilt?: number;
  tape?: boolean;
  /** Where and when the print was made; shown as a round post-office cancellation mark. */
  postmark?: { place: string; date: string };
  /** Slide in from above like a fresh print (plays once). */
  develop?: boolean;
  /** A CSS filter() value applied to the photo/art only, not the frame or caption. */
  filter?: string;
  /** One of FRAME_PRESETS' ids (see src/lib/frames.ts) — controls frame color, border, tape and
   * caption color. Defaults to the original white-and-ink look. */
  frameId?: string;
  /** Decorative stickers placed over the photo. */
  stickers?: PlacedSticker[];
  /** When true, stickers can be dragged, resized and removed. Every caller that leaves this unset
   * gets plain, static sticker rendering — only an active editor opts in. */
  editableStickers?: boolean;
  onStickersChange?: (next: PlacedSticker[]) => void;
  className?: string;
  children?: ReactNode;
}

/** An instant print: white frame, thick bottom margin, handwritten caption, optional tape and postmark. */
export function Polaroid({
  artId,
  photo,
  aspect,
  caption,
  tilt = 0,
  tape = false,
  postmark,
  develop = false,
  filter,
  frameId = DEFAULT_FRAME_ID,
  stickers,
  editableStickers = false,
  onStickersChange,
  className,
  children,
}: PolaroidProps) {
  const style = (develop ? { "--tilt": `${tilt}deg` } : { rotate: `${tilt}deg` }) as CSSProperties;
  const frame = frameFor(frameId);
  const showTape = tape && frame.tapeColor !== null;
  const frameStyle: CSSProperties =
    frame.pattern && frame.patternColor
      ? {
          backgroundImage: `url("${patternDataUri(frame.pattern, frame.frameBg, frame.patternColor)}")`,
          backgroundSize: `${PATTERN_TILE_SIZE}px ${PATTERN_TILE_SIZE}px`,
          backgroundRepeat: "repeat",
        }
      : { background: frame.frameBg };

  return (
    <figure
      className={cn(
        "sticker relative w-full rounded-md p-2.5 pb-3 sm:p-3 sm:pb-4",
        develop && "animate-print-in",
        className,
      )}
      style={{
        ...style,
        ...frameStyle,
        borderColor: frame.borderColor,
        borderStyle: frame.dashedBorder ? "dashed" : undefined,
      }}
    >
      {frame.stripe ? (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 grid h-1.5 grid-cols-3 overflow-hidden rounded-t-[inherit]"
        >
          <span style={{ background: "#ff9933" }} />
          <span style={{ background: "#ffffff" }} />
          <span style={{ background: "#138808" }} />
        </div>
      ) : null}
      {showTape ? (
        <span
          aria-hidden="true"
          className="absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 -rotate-3 border-2 border-ink/70"
          style={{ background: `${frame.tapeColor}e6` }}
        />
      ) : null}
      <div className="relative">
        {photo ? (
          <img
            src={photo}
            alt="Your photo from camera mode"
            className="block w-full border-2 border-ink bg-ink object-cover"
            style={{ aspectRatio: Math.min(1.4, Math.max(0.75, aspect ?? 1)), filter }}
          />
        ) : (
          <Art
            artId={artId}
            className="block aspect-square w-full border-2 border-ink"
            style={{ filter }}
          />
        )}
        {stickers && stickers.length > 0 ? (
          <StickerLayer
            stickers={stickers}
            editable={editableStickers}
            onChange={onStickersChange}
          />
        ) : null}
        {frame.swirlColor ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 200 40"
            className="pointer-events-none absolute bottom-[6%] left-[15%] w-[70%]"
          >
            <path
              d="M5,20 Q30,2 55,20 T105,20 T155,20 T195,20"
              fill="none"
              stroke={frame.swirlColor}
              strokeWidth="7"
              strokeLinecap="round"
            />
          </svg>
        ) : null}
      </div>
      {postmark ? (
        <Postmark
          place={postmark.place}
          date={postmark.date}
          className="pointer-events-none absolute right-2 bottom-1.5 z-10 w-[4.5rem] -rotate-12 text-sindoor/80 mix-blend-multiply sm:w-20"
        />
      ) : null}
      <figcaption className="mt-2 flex min-h-12 flex-col items-center justify-center text-center">
        <span
          className="font-hand text-[26px] leading-none font-bold"
          style={{ color: frame.captionColor }}
        >
          {caption}
        </span>
        {children}
      </figcaption>
    </figure>
  );
}
