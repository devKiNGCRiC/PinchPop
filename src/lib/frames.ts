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
const LEAF = "#138808";
const SAFFRON = "#ff9933";
const MAROON = "#7a1626";
const PAPER = "#ece3d2";

export interface DefaultSticker {
  iconId: string;
  x: number;
  y: number;
  size: number;
}

export interface FramePreset {
  id: string;
  label: string;
  /** A flat color, used as-is when neither `gradient` nor `pattern` is present. */
  frameBg: string;
  /** A two-color diagonal gradient. */
  gradient?: [string, string];
  /** A tiled two-tone pattern (see src/lib/framePatterns.ts) — takes priority over `gradient`. */
  pattern?: PatternKind;
  patternColor?: string;
  borderColor: string;
  captionColor: string;
  /** Tape color, or null for frames that skip the tape strip entirely. */
  tapeColor: string | null;
  /** A hand-drawn squiggle doodle near the bottom of the photo. */
  swirlColor?: string;
  /** Gives the photo a ragged, hand-torn-paper edge instead of a straight rectangle (see
   * src/lib/tornEdge.ts), for frames modeled on scrapbook/collage reference photos. */
  tornEdge?: boolean;
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
    id: "sunset",
    label: "Sunset",
    frameBg: SAFFRON,
    gradient: [SAFFRON, CORAL],
    borderColor: INK,
    captionColor: "#ffffff",
    tapeColor: CLOUD,
  },
  {
    id: "ocean",
    label: "Ocean",
    frameBg: CHAKRA,
    gradient: [CHAKRA, "#5b8def"],
    borderColor: CLOUD,
    captionColor: "#ffffff",
    tapeColor: MARIGOLD,
  },
  {
    id: "blush",
    label: "Blush",
    frameBg: CORAL,
    gradient: [CORAL, MARIGOLD],
    borderColor: INK,
    captionColor: INK,
    tapeColor: CLOUD,
  },
  {
    id: "berry",
    label: "Berry",
    frameBg: SINDOOR,
    gradient: [SINDOOR, CORAL],
    borderColor: INK,
    captionColor: "#ffffff",
    tapeColor: CLOUD,
  },
  {
    id: "golden-hour",
    label: "Golden Hour",
    frameBg: MARIGOLD,
    gradient: [MARIGOLD, SAFFRON],
    borderColor: INK,
    captionColor: INK,
    tapeColor: CLOUD,
  },
  {
    id: "dusk",
    label: "Dusk",
    frameBg: CHAKRA,
    gradient: [CHAKRA, SINDOOR],
    borderColor: CLOUD,
    captionColor: "#ffffff",
    tapeColor: MARIGOLD,
  },
  {
    id: "mint",
    label: "Mint",
    frameBg: LEAF,
    gradient: [LEAF, CLOUD],
    borderColor: INK,
    captionColor: INK,
    tapeColor: MARIGOLD,
  },
  {
    id: "lagoon",
    label: "Lagoon",
    frameBg: CHAKRA,
    gradient: [CHAKRA, LEAF],
    borderColor: CLOUD,
    captionColor: "#ffffff",
    tapeColor: CLOUD,
  },
  {
    id: "rosewood",
    label: "Rosewood",
    frameBg: SINDOOR,
    gradient: [SINDOOR, IVORY],
    borderColor: INK,
    captionColor: INK,
    tapeColor: MARIGOLD,
  },
  {
    id: "candy-stripe",
    label: "Candy Stripe",
    frameBg: "#ffffff",
    gradient: ["#ffffff", "#dde6fb"],
    pattern: "diagonal-stripes",
    patternColor: CHAKRA,
    borderColor: INK,
    captionColor: INK,
    tapeColor: CORAL,
    defaultStickers: [
      { iconId: "star", x: 0.15, y: 0.88, size: 0.14 },
      { iconId: "star", x: 0.32, y: 0.92, size: 0.1 },
      { iconId: "star", x: 0.85, y: 0.9, size: 0.11 },
    ],
  },
  {
    id: "polka-dot",
    label: "Polka Dot",
    frameBg: CORAL,
    gradient: [CORAL, "#ffd9a0"],
    pattern: "dots",
    patternColor: MARIGOLD,
    borderColor: INK,
    captionColor: INK,
    tapeColor: CLOUD,
    swirlColor: LEAF,
    defaultStickers: [
      { iconId: "heart", x: 0.13, y: 0.12, size: 0.14 },
      { iconId: "heart", x: 0.87, y: 0.87, size: 0.19 },
    ],
  },
  {
    id: "daisy-chain",
    label: "Daisy Chain",
    frameBg: IVORY,
    gradient: [IVORY, "#ffe0d9"],
    pattern: "stripes",
    patternColor: CORAL,
    borderColor: INK,
    captionColor: INK,
    tapeColor: CLOUD,
    defaultStickers: [
      { iconId: "flower", x: 0.86, y: 0.11, size: 0.15 },
      { iconId: "flower", x: 0.13, y: 0.14, size: 0.12 },
      { iconId: "flower", x: 0.14, y: 0.88, size: 0.14 },
      { iconId: "leaf", x: 0.32, y: 0.92, size: 0.1 },
    ],
  },
  {
    id: "bow-stripe",
    label: "Bow",
    frameBg: MARIGOLD,
    gradient: [MARIGOLD, SAFFRON],
    pattern: "stripes",
    patternColor: CORAL,
    borderColor: INK,
    captionColor: INK,
    tapeColor: null,
    defaultStickers: [
      { iconId: "bow", x: 0.5, y: 0.07, size: 0.17 },
      { iconId: "star", x: 0.85, y: 0.88, size: 0.11 },
    ],
  },
  {
    id: "gingham",
    label: "Gingham",
    frameBg: "#ffffff",
    gradient: ["#ffffff", "#ffe3df"],
    pattern: "gingham",
    patternColor: CORAL,
    borderColor: INK,
    captionColor: INK,
    tapeColor: MARIGOLD,
  },
  {
    id: "coral-reef",
    label: "Coral Reef",
    frameBg: CORAL,
    gradient: [CORAL, CHAKRA],
    borderColor: INK,
    captionColor: "#ffffff",
    tapeColor: CLOUD,
  },
  {
    id: "honeycomb",
    label: "Honeycomb",
    frameBg: MARIGOLD,
    gradient: [MARIGOLD, LEAF],
    borderColor: INK,
    captionColor: INK,
    tapeColor: CLOUD,
  },
  {
    id: "rose-gold",
    label: "Rose Gold",
    frameBg: SINDOOR,
    gradient: [SINDOOR, MARIGOLD],
    borderColor: INK,
    captionColor: "#ffffff",
    tapeColor: CLOUD,
  },
  {
    id: "paper-bloom",
    label: "Paper Bloom",
    frameBg: IVORY,
    gradient: [IVORY, PAPER],
    borderColor: INK,
    captionColor: INK,
    tapeColor: CLOUD,
    defaultStickers: [
      { iconId: "hibiscus", x: 0.92, y: 0.05, size: 0.42 },
      { iconId: "hibiscus", x: 0.05, y: 0.95, size: 0.4 },
      { iconId: "leaf", x: 0.83, y: 0.23, size: 0.1 },
    ],
  },
  {
    id: "scarlet-ribbon",
    label: "Scarlet Ribbon",
    frameBg: MAROON,
    borderColor: IVORY,
    captionColor: IVORY,
    tapeColor: null,
    tornEdge: true,
    defaultStickers: [{ iconId: "satin-bow", x: 0.5, y: 0.045, size: 0.26 }],
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
    id: "vintage",
    label: "Vintage",
    frameBg: IVORY,
    borderColor: SINDOOR,
    captionColor: INK,
    tapeColor: MARIGOLD,
  },
];

export function frameFor(id: string): FramePreset {
  return FRAME_PRESETS.find((preset) => preset.id === id) ?? FRAME_PRESETS[0];
}
