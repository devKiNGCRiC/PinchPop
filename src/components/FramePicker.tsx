import { FRAME_PRESETS } from "@/lib/frames";
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
              style={{
                background: preset.gradient
                  ? `linear-gradient(135deg, ${preset.gradient[0]}, ${preset.gradient[1]})`
                  : preset.frameBg,
              }}
            />
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
