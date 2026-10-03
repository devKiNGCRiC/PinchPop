import type { CaptionBackground } from "@/lib/captionFonts";
import { CAPTION_FONTS, MAX_CAPTION_SIZE, MIN_CAPTION_SIZE } from "@/lib/captionFonts";
import { cn } from "@/lib/utils";

interface CaptionStylePickerProps {
  fontId: string;
  onFontChange: (id: string) => void;
  size: number;
  onSizeChange: (size: number) => void;
  color: string;
  onColorChange: (color: string) => void;
  background: CaptionBackground;
  onBackgroundChange: (background: CaptionBackground) => void;
  bgColor: string;
  onBgColorChange: (color: string) => void;
}

/** Caption font, size, color and background controls — all of these only ever affect the caption
 * text, never the frame or the brand mark. */
export function CaptionStylePicker({
  fontId,
  onFontChange,
  size,
  onSizeChange,
  color,
  onColorChange,
  background,
  onBackgroundChange,
  bgColor,
  onBgColorChange,
}: CaptionStylePickerProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-semibold text-ink-soft">Font</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {CAPTION_FONTS.map((font) => (
            <button
              key={font.id}
              type="button"
              onClick={() => onFontChange(font.id)}
              aria-pressed={fontId === font.id}
              style={{ fontFamily: font.family }}
              className={cn(
                "sticker rounded-full border-[2.5px] border-ink px-4 py-1.5 text-lg",
                fontId === font.id ? "bg-saffron text-ink" : "bg-white text-ink-soft",
              )}
            >
              {font.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1.5 text-sm font-semibold text-ink-soft">
        Size
        <input
          type="range"
          min={MIN_CAPTION_SIZE}
          max={MAX_CAPTION_SIZE}
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="accent-chakra"
        />
      </label>

      <label className="flex items-center gap-3 text-sm font-semibold text-ink-soft">
        Text color
        <input
          type="color"
          value={color}
          onChange={(e) => onColorChange(e.target.value)}
          className="size-9 cursor-pointer rounded-full border-2 border-ink p-0.5"
        />
      </label>

      <div>
        <p className="text-sm font-semibold text-ink-soft">Background</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {(["plain", "tape"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onBackgroundChange(option)}
              aria-pressed={background === option}
              className={cn(
                "sticker rounded-full border-[2.5px] border-ink px-4 py-1.5 text-sm font-semibold capitalize",
                background === option ? "bg-saffron text-ink" : "bg-white text-ink-soft",
              )}
            >
              {option}
            </button>
          ))}
          {background === "tape" ? (
            <input
              type="color"
              value={bgColor}
              onChange={(e) => onBgColorChange(e.target.value)}
              aria-label="Tape color"
              className="size-9 cursor-pointer rounded-full border-2 border-ink p-0.5"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
