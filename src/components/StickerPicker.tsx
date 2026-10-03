import { STICKER_EMOJIS } from "@/lib/stickers";

interface StickerPickerProps {
  onAdd: (emoji: string) => void;
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
        {STICKER_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onAdd(emoji)}
            aria-label={`Add ${emoji} sticker`}
            className="pop sticker flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white text-2xl"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
