export interface PlacedSticker {
  id: string;
  emoji: string;
  /** 0-1, relative to the photo's own width/height — the sticker's center point. */
  x: number;
  y: number;
  /** 0-1, relative to the photo's width — the sticker's diameter. */
  size: number;
}

// Plain emoji rather than custom-drawn icons: colorful, instantly recognizable, and free to use
// with zero licensing or illustration effort — a real set of "every type of cute and cool sticker"
// without needing to hand-draw dozens of them.
export const STICKER_EMOJIS: string[] = [
  "🌸",
  "🌼",
  "🌻",
  "🌷",
  "🌹",
  "❤️",
  "💕",
  "💖",
  "⭐",
  "✨",
  "🌟",
  "🎉",
  "🎊",
  "🥳",
  "😎",
  "😂",
  "🔥",
  "🌈",
  "☀️",
  "🌴",
  "🦋",
  "🐾",
  "👑",
  "📸",
  "🎵",
  "💯",
];

const DEFAULT_SIZE = 0.16;

/** A new sticker at a slightly randomized spot near center, so adding several in a row doesn't
 * stack them exactly on top of each other before the player drags them apart. */
export function createSticker(emoji: string): PlacedSticker {
  return {
    id: crypto.randomUUID(),
    emoji,
    x: 0.5 + (Math.random() - 0.5) * 0.3,
    y: 0.5 + (Math.random() - 0.5) * 0.3,
    size: DEFAULT_SIZE,
  };
}
