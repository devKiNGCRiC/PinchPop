export interface PlacedSticker {
  id: string;
  /** One of STICKER_ICONS' ids (see src/lib/stickerIcons.ts). */
  iconId: string;
  /** 0-1, relative to the photo's own width/height — the sticker's center point. */
  x: number;
  y: number;
  /** 0-1, relative to the photo's width — the sticker's diameter. */
  size: number;
}

const DEFAULT_SIZE = 0.16;

/** A new sticker at a slightly randomized spot near center, so adding several in a row doesn't
 * stack them exactly on top of each other before the player drags them apart. */
export function createSticker(iconId: string): PlacedSticker {
  return {
    id: crypto.randomUUID(),
    iconId,
    x: 0.5 + (Math.random() - 0.5) * 0.3,
    y: 0.5 + (Math.random() - 0.5) * 0.3,
    size: DEFAULT_SIZE,
  };
}
