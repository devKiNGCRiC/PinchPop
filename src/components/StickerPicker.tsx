import { useState } from "react";
import { Plus } from "lucide-react";

import { PopButton } from "@/components/PopButton";
import { STICKER_ICONS, stickerIconDataUri } from "@/lib/stickerIcons";

interface StickerPickerProps {
  onAdd: (iconId: string) => void;
  onAddBanner: (text: string) => void;
  /** Shown as a "Clear" link next to the label when there's something to clear. */
  onClear?: () => void;
}

/** A tray of stickers to drop onto the photo — tap one to add it, then drag it into place. A
 * labeled banner is its own row since, unlike the fixed icons, it needs its text typed first. */
export function StickerPicker({ onAdd, onAddBanner, onClear }: StickerPickerProps) {
  const [bannerText, setBannerText] = useState("");

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

      <div className="mt-3 flex items-center gap-2">
        <input
          maxLength={20}
          placeholder="My Love"
          value={bannerText}
          onChange={(e) => setBannerText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && bannerText.trim()) {
              onAddBanner(bannerText.trim());
              setBannerText("");
            }
          }}
          className="w-full min-w-0 rounded-full border-2 border-ink bg-white px-3 py-1.5 text-sm outline-none focus:ring-4 focus:ring-marigold/50"
        />
        <PopButton
          tone="white"
          size="sm"
          disabled={!bannerText.trim()}
          onClick={() => {
            onAddBanner(bannerText.trim());
            setBannerText("");
          }}
        >
          <Plus className="size-4" aria-hidden="true" />
          Label
        </PopButton>
      </div>
    </div>
  );
}
