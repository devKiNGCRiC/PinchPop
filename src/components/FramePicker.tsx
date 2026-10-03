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
        {FRAME_PRESETS.map((preset) => (
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
              style={
                preset.pattern && preset.patternColor
                  ? {
                      backgroundImage: `url("${patternDataUri(preset.pattern, preset.frameBg, preset.patternColor)}")`,
                      backgroundSize: `${PATTERN_TILE_SIZE / 2}px ${PATTERN_TILE_SIZE / 2}px`,
                    }
                  : { background: preset.frameBg }
              }
            />
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
