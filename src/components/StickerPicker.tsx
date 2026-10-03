import { STICKER_ICONS, stickerIconDataUri } from "@/lib/stickerIcons";

interface StickerPickerProps {
  onAdd: (iconId: string) => void;
  /** Shown as a "Clear" link next to the label when there's something to clear. */
  onClear?: () => void;
}

/** A tray of stickers to drop onto the photo — tap one to add it, then drag it into place. */
export function StickerPicker({ onAdd, onClear }: StickerPickerProps) {
  return (
    <div>
      {onClear ? (
        <button
          type="button"
          onClick={onClear}
          className="mb-2 text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          Clear stickers
        </button>
      ) : null}
      <div className="flex max-w-full flex-wrap gap-2">
        {STICKER_ICONS.map((icon) => (
          <button
            key={icon.id}
            type="button"
            onClick={() => onAdd(icon.id)}
            aria-label={`Add ${icon.label} sticker`}
            className="pop sticker flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white p-2"
          >
            <img src={stickerIconDataUri(icon.id)} alt="" className="size-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
