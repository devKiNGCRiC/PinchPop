import type { CSSProperties, ReactNode } from "react";

import { Art } from "@/components/Art";
import { StickerLayer } from "@/components/StickerLayer";
import { Postmark } from "@/components/Stamp";
import {
  captionFontFor,
  DEFAULT_CAPTION_BACKGROUND,
  DEFAULT_CAPTION_FONT_ID,
  DEFAULT_CAPTION_SIZE,
} from "@/lib/captionFonts";
import type { CaptionBackground } from "@/lib/captionFonts";
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
  /** Empty renders no caption at all — there is no implicit placeholder text baked into prints. */
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
  /** One of CAPTION_FONTS' ids (see src/lib/captionFonts.ts). Defaults to the handwritten font. */
  captionFontId?: string;
  /** Caption font size in px. Defaults to 26. */
  captionSize?: number;
  /** Overrides the frame's own caption color when set. */
  captionColor?: string;
  /** "tape" sits the caption on a rotated colored strip, like a hand-placed label. Defaults to
   * "plain" (no background). */
  captionBackground?: CaptionBackground;
  /** The tape color when `captionBackground` is "tape". */
  captionBgColor?: string;
  /** Decorative stickers placed over the photo. */
  stickers?: PlacedSticker[];
  /** When true, stickers can be dragged, resized and removed. Every caller that leaves this unset
   * gets plain, static sticker rendering — only an active editor opts in. */
  editableStickers?: boolean;
  onStickersChange?: (next: PlacedSticker[]) => void;
  className?: string;
  children?: ReactNode;
}

/** An instant print: colored frame, thick bottom margin, handwritten caption, optional tape and postmark. */
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
  captionFontId = DEFAULT_CAPTION_FONT_ID,
  captionSize = DEFAULT_CAPTION_SIZE,
  captionColor,
  captionBackground = DEFAULT_CAPTION_BACKGROUND,
  captionBgColor,
  stickers,
  editableStickers = false,
  onStickersChange,
  className,
  children,
}: PolaroidProps) {
  const style = (develop ? { "--tilt": `${tilt}deg` } : { rotate: `${tilt}deg` }) as CSSProperties;
  const frame = frameFor(frameId);
  const showTape = tape && frame.tapeColor !== null;
  const font = captionFontFor(captionFontId);

  // Layered so a frame can be both patterned AND a gradient at once — the pattern tile has a
  // transparent background and only draws its semi-opaque foreground shape, so the gradient (or
  // flat color) underneath shows through between the pattern's own marks.
  const images: string[] = [];
  const sizes: string[] = [];
  const repeats: string[] = [];
  if (frame.pattern) {
    images.push(`url("${patternDataUri(frame.pattern, frame.patternColor ?? frame.borderColor)}")`);
    sizes.push(`${PATTERN_TILE_SIZE}px ${PATTERN_TILE_SIZE}px`);
    repeats.push("repeat");
  }
  if (frame.gradient) {
    images.push(`linear-gradient(135deg, ${frame.gradient[0]}, ${frame.gradient[1]})`);
    sizes.push("100% 100%");
    repeats.push("no-repeat");
  }
  const frameStyle: CSSProperties =
    images.length > 0
      ? {
          backgroundColor: frame.gradient ? undefined : frame.frameBg,
          backgroundImage: images.join(", "),
          backgroundSize: sizes.join(", "),
          backgroundRepeat: repeats.join(", "),
        }
      : { background: frame.frameBg };

  return (
    <figure
      className={cn(
        "sticker relative w-full rounded-md p-2.5 pb-3 sm:p-3 sm:pb-4",
        develop && "animate-print-in",
        className,
      )}
      style={{ ...style, ...frameStyle, borderColor: frame.borderColor }}
    >
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
        {caption ? (
          <span
            className={cn(
              "leading-none font-bold",
              captionBackground === "tape" && "-rotate-1 rounded-sm px-3 py-1",
            )}
            style={{
              color: captionColor ?? frame.captionColor,
              fontFamily: font.family,
              fontSize: `${captionSize}px`,
              background:
                captionBackground === "tape" ? `${captionBgColor ?? "#ffc61a"}cc` : undefined,
            }}
          >
            {caption}
          </span>
        ) : null}
        {children}
      </figcaption>
    </figure>
  );
}
