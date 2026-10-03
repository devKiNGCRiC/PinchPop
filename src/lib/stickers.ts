import { BANNER_ASPECT } from "@/lib/bannerArt";

export interface PlacedSticker {
  id: string;
  /** One of STICKER_ICONS' ids (see src/lib/stickerIcons.ts), or "banner" for a custom-text label. */
  iconId: string;
  /** Only used when `iconId` is "banner". */
  text?: string;
  /** 0-1, relative to the photo's own width/height — the sticker's center point. */
  x: number;
  y: number;
  /** 0-1, relative to the photo's width — the sticker's own width. */
  size: number;
  /** Width divided by height. Defaults to 1 (square) for icon stickers; banners are wider. */
  aspect?: number;
}

const DEFAULT_SIZE = 0.16;
const DEFAULT_BANNER_SIZE = 0.42;

function randomNearCenter(): { x: number; y: number } {
  return {
    x: 0.5 + (Math.random() - 0.5) * 0.3,
    y: 0.5 + (Math.random() - 0.5) * 0.3,
  };
}

/** A new sticker at a slightly randomized spot near center, so adding several in a row doesn't
 * stack them exactly on top of each other before the player drags them apart. */
export function createSticker(iconId: string): PlacedSticker {
  return { id: crypto.randomUUID(), iconId, size: DEFAULT_SIZE, ...randomNearCenter() };
}

/** A labeled ribbon/banner sticker carrying its own custom text (see src/lib/bannerArt.ts). */
export function createBanner(text: string): PlacedSticker {
  return {
    id: crypto.randomUUID(),
    iconId: "banner",
    text,
    size: DEFAULT_BANNER_SIZE,
    aspect: BANNER_ASPECT,
    ...randomNearCenter(),
  };
}
