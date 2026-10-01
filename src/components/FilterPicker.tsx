import { FILTER_PRESETS } from "@/lib/filters";
import { cn } from "@/lib/utils";

interface FilterPickerProps {
  value: string;
  onChange: (id: string) => void;
}

/** A row of look presets baked into the photo when it is saved, downloaded or shared. */
export function FilterPicker({ value, onChange }: FilterPickerProps) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink-soft">Filter</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {FILTER_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onChange(preset.id)}
            aria-pressed={value === preset.id}
            className={cn(
              "sticker rounded-full border-[2.5px] border-ink px-4 py-1.5 text-sm font-semibold",
              value === preset.id ? "bg-saffron text-ink" : "bg-white text-ink-soft",
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
