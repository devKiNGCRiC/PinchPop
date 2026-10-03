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

export interface FramePreset {
  id: string;
  label: string;
  /** A flat color, used as-is when `gradient` is absent. */
  frameBg: string;
  /** A two-color diagonal gradient — the frame's primary look when present. */
  gradient?: [string, string];
  borderColor: string;
  captionColor: string;
  /** Tape color, or null for frames that skip the tape strip entirely. */
  tapeColor: string | null;
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
