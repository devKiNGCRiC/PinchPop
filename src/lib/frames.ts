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

export type QuickDesign =
  "film" | "notebook" | "cassette" | "sticky" | "lace" | "ribbon" | "note" | "dried";

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
  /** A whole-card design (see drawFilm/drawNotebook/... in src/lib/export.ts) that replaces the
   * plain frame: the card is built from one physical object, not just colors. */
  design?: QuickDesign;
  /** Placed automatically the first time this frame is picked on a photo with no stickers yet —
   * never overwrites stickers someone has already placed. */
  defaultStickers?: DefaultSticker[];
}

export const DEFAULT_FRAME_ID = "classic";

export const FRAME_PRESETS: FramePreset[] = [
  {
    id: "film-roll",
    label: "Film Roll",
    frameBg: INK,
    borderColor: INK,
    captionColor: IVORY,
    tapeColor: null,
    design: "film",
  },
  {
    id: "notebook",
    label: "Notebook",
    frameBg: "#fdf8ec",
    borderColor: INK,
    captionColor: INK,
    tapeColor: null,
    design: "notebook",
  },
  {
    id: "cassette",
    label: "Cassette",
    frameBg: "#f6ecd6",
    borderColor: INK,
    captionColor: INK,
    tapeColor: null,
    design: "cassette",
  },
  {
    id: "sticky-note",
    label: "Sticky Note",
    frameBg: "#ffe27a",
    borderColor: INK,
    captionColor: INK,
    tapeColor: null,
    design: "sticky",
  },
  {
    id: "lace-blush",
    label: "Lace Blush",
    frameBg: "#f7d6dc",
    pattern: "lace",
    patternColor: "#ffffff",
    borderColor: "#e6e0e8",
    captionColor: "#7a2a46",
    tapeColor: null,
    design: "lace",
  },
  {
    id: "pink-ribbon",
    label: "Pink Ribbon",
    frameBg: "#ffffff",
    borderColor: "#e9e6ea",
    captionColor: "#8a1f44",
    tapeColor: null,
    design: "ribbon",
  },
  {
    id: "torn-note",
    label: "Torn Note",
    frameBg: "#faf4ea",
    borderColor: INK,
    captionColor: "#5a3b44",
    tapeColor: null,
    design: "note",
  },
  {
    id: "pressed-flowers",
    label: "Pressed Flowers",
    frameBg: "#fbfaf7",
    borderColor: "#e6e2da",
    captionColor: "#6b5a4a",
    tapeColor: null,
    design: "dried",
  },
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
  },
  {
    id: "scarlet-ribbon",
    label: "Scarlet Ribbon",
    frameBg: MAROON,
    borderColor: IVORY,
    captionColor: IVORY,
    tapeColor: null,
    tornEdge: true,
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
