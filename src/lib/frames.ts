import type { PatternKind } from "@/lib/framePatterns";

// Hex values here mirror the design tokens in src/index.css (--color-*) rather than inventing new
// colors, so every frame stays visually consistent with the rest of the app.
const INK = "#111426";
const CLOUD = "#fffdf8";
const IVORY = "#fff6e6";
const CHAKRA = "#1c34a6";
const MARIGOLD = "#ffc61a";
const SINDOOR = "#d7263d";
const CORAL = "#ff6b5b";

export interface DefaultSticker {
  emoji: string;
  x: number;
  y: number;
  size: number;
}

export interface FramePreset {
  id: string;
  label: string;
  frameBg: string;
  /** Present together to render a tiled pattern instead of a flat frameBg fill. */
  pattern?: PatternKind;
  patternColor?: string;
  borderColor: string;
  captionColor: string;
  /** Tape color, or null for frames that skip the tape strip entirely. */
  tapeColor: string | null;
  /** Only "tiranga" uses this — a thin saffron/white/leaf stripe echoing the footer's flag motif. */
  stripe?: boolean;
  /** A dashed rather than solid border, for a lighter decorative touch. */
  dashedBorder?: boolean;
  /** Placed automatically the first time this frame is picked on a photo with no stickers yet —
   * never overwrites stickers someone has already placed. */
  defaultStickers?: DefaultSticker[];
}

export const DEFAULT_FRAME_ID = "classic";

export const FRAME_PRESETS: FramePreset[] = [
  {
    id: "classic",
    label: "Classic",
    frameBg: "#ffffff",
    borderColor: INK,
    captionColor: INK,
    tapeColor: MARIGOLD,
  },
  {
    id: "candy-stripe",
    label: "Candy Stripe",
    frameBg: "#ffffff",
    pattern: "stripes",
    patternColor: CHAKRA,
    borderColor: INK,
    captionColor: INK,
    tapeColor: CORAL,
    defaultStickers: [
      { emoji: "⭐", x: 0.14, y: 0.88, size: 0.13 },
      { emoji: "⭐", x: 0.3, y: 0.92, size: 0.1 },
    ],
  },
  {
    id: "polka-dot",
    label: "Polka Dot",
    frameBg: CORAL,
    pattern: "dots",
    patternColor: MARIGOLD,
    borderColor: INK,
    captionColor: INK,
    tapeColor: CLOUD,
    defaultStickers: [
      { emoji: "💖", x: 0.14, y: 0.13, size: 0.15 },
      { emoji: "💕", x: 0.87, y: 0.86, size: 0.13 },
    ],
  },
  {
    id: "daisy-chain",
    label: "Daisy Chain",
    frameBg: IVORY,
    pattern: "stripes",
    patternColor: CORAL,
    borderColor: INK,
    captionColor: INK,
    tapeColor: CLOUD,
    defaultStickers: [
      { emoji: "🌼", x: 0.88, y: 0.12, size: 0.15 },
      { emoji: "🌸", x: 0.13, y: 0.87, size: 0.14 },
    ],
  },
  {
    id: "gingham",
    label: "Gingham",
    frameBg: "#ffffff",
    pattern: "gingham",
    patternColor: CORAL,
    borderColor: INK,
    captionColor: INK,
    tapeColor: MARIGOLD,
  },
  {
    id: "bow",
    label: "Bow",
    frameBg: MARIGOLD,
    pattern: "stripes",
    patternColor: CLOUD,
    borderColor: INK,
    captionColor: INK,
    tapeColor: null,
    defaultStickers: [{ emoji: "🎀", x: 0.5, y: 0.07, size: 0.16 }],
  },
  {
    id: "vintage",
    label: "Vintage",
    frameBg: IVORY,
    borderColor: SINDOOR,
    captionColor: INK,
    tapeColor: MARIGOLD,
  },
  {
    id: "noir",
    label: "Noir",
    frameBg: INK,
    borderColor: CLOUD,
    captionColor: CLOUD,
    tapeColor: SINDOOR,
  },
  {
    id: "minimal",
    label: "Minimal",
    frameBg: CLOUD,
    borderColor: "#4a4f6e",
    captionColor: "#4a4f6e",
    tapeColor: null,
    dashedBorder: true,
  },
  {
    id: "tiranga",
    label: "Tiranga",
    frameBg: IVORY,
    borderColor: INK,
    captionColor: INK,
    tapeColor: MARIGOLD,
    stripe: true,
  },
];

export function frameFor(id: string): FramePreset {
  return FRAME_PRESETS.find((preset) => preset.id === id) ?? FRAME_PRESETS[0];
}
