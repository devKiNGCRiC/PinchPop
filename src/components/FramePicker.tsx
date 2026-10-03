import type { CSSProperties } from "react";

import { FRAME_PRESETS } from "@/lib/frames";
import { patternDataUri, PATTERN_TILE_SIZE } from "@/lib/framePatterns";
import { cn } from "@/lib/utils";

interface FramePickerProps {
  value: string;
  onChange: (id: string) => void;
}

/** A row of polaroid frame presets — color, border and tape, baked into the exported image. */
export function FramePicker({ value, onChange }: FramePickerProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FRAME_PRESETS.map((preset) => {
          const images: string[] = [];
          const sizes: string[] = [];
          if (preset.pattern) {
            images.push(
              `url("${patternDataUri(preset.pattern, preset.patternColor ?? preset.borderColor)}")`,
            );
            sizes.push(`${PATTERN_TILE_SIZE / 2}px ${PATTERN_TILE_SIZE / 2}px`);
          }
          if (preset.gradient) {
            images.push(`linear-gradient(135deg, ${preset.gradient[0]}, ${preset.gradient[1]})`);
            sizes.push("100% 100%");
          }
          const swatchStyle: CSSProperties =
            images.length > 0
              ? {
                  backgroundColor: preset.gradient ? undefined : preset.frameBg,
                  backgroundImage: images.join(", "),
                  backgroundSize: sizes.join(", "),
                }
              : { background: preset.frameBg };
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(preset.id)}
              aria-pressed={value === preset.id}
              className={cn(
                "sticker flex items-center gap-2 rounded-full border-[2.5px] border-ink py-1.5 pr-4 pl-1.5 text-sm font-semibold",
                value === preset.id ? "bg-saffron text-ink" : "bg-white text-ink-soft",
              )}
            >
              <span
                aria-hidden="true"
                className="size-6 shrink-0 rounded-full border-2 border-ink"
                style={swatchStyle}
              />
              {preset.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
