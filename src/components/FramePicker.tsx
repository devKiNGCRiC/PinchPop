import { useState } from "react";
import type { CSSProperties } from "react";

import { FEATURED_FRAME_IDS, FRAME_PRESETS } from "@/lib/frames";
import type { FramePreset } from "@/lib/frames";
import { patternDataUri, PATTERN_TILE_SIZE } from "@/lib/framePatterns";
import { cn } from "@/lib/utils";

interface FramePickerProps {
  value: string;
  onChange: (id: string) => void;
}

const FEATURED = FEATURED_FRAME_IDS.map((id) => FRAME_PRESETS.find((p) => p.id === id)).filter(
  (p): p is FramePreset => p !== undefined,
);
const OTHERS = FRAME_PRESETS.filter((p) => !FEATURED_FRAME_IDS.includes(p.id));

function swatchStyle(preset: FramePreset): CSSProperties {
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
  return images.length > 0
    ? {
        backgroundColor: preset.gradient ? undefined : preset.frameBg,
        backgroundImage: images.join(", "),
        backgroundSize: sizes.join(", "),
      }
    : { background: preset.frameBg };
}

/** Frame presets — a featured handful first, the rest behind "More frames". */
export function FramePicker({ value, onChange }: FramePickerProps) {
  // Open the full list straight away if the current frame isn't one of the featured ones.
  const [showAll, setShowAll] = useState(() => !FEATURED_FRAME_IDS.includes(value));
  const selectedOther = OTHERS.find((p) => p.id === value);
  const shown = showAll
    ? [...FEATURED, ...OTHERS]
    : selectedOther
      ? [...FEATURED, selectedOther]
      : FEATURED;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {shown.map((preset) => (
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
              style={swatchStyle(preset)}
            />
            {preset.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setShowAll((all) => !all)}
        aria-expanded={showAll}
        className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-chakra underline underline-offset-4 hover:text-ink"
      >
        {showAll ? "Show fewer frames" : `More frames (${OTHERS.length})`}
      </button>
    </div>
  );
}
