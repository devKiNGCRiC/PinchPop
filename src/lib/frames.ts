// Hex values here mirror the design tokens in src/index.css (--color-*) rather than inventing new
// colors, so every frame stays visually consistent with the rest of the app.
const INK = "#111426";
const CLOUD = "#fffdf8";
const IVORY = "#fff6e6";
const CHAKRA = "#1c34a6";
const SAFFRON = "#ff9933";
const MARIGOLD = "#ffc61a";
const LEAF = "#138808";
const SINDOOR = "#d7263d";
const CORAL = "#ff6b5b";

export interface FramePreset {
  id: string;
  label: string;
  frameBg: string;
  borderColor: string;
  captionColor: string;
  /** Tape color, or null for frames that skip the tape strip entirely. */
  tapeColor: string | null;
  /** Only "tiranga" uses this — a thin saffron/white/leaf stripe echoing the footer's flag motif. */
  stripe?: boolean;
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
    id: "noir",
    label: "Noir",
    frameBg: INK,
    borderColor: CLOUD,
    captionColor: CLOUD,
    tapeColor: SINDOOR,
  },
  {
    id: "sunset",
    label: "Sunset",
    frameBg: SAFFRON,
    borderColor: INK,
    captionColor: INK,
    tapeColor: CLOUD,
  },
  {
    id: "ocean",
    label: "Ocean",
    frameBg: CHAKRA,
    borderColor: CLOUD,
    captionColor: CLOUD,
    tapeColor: MARIGOLD,
  },
  {
    id: "meadow",
    label: "Meadow",
    frameBg: LEAF,
    borderColor: INK,
    captionColor: CLOUD,
    tapeColor: MARIGOLD,
  },
  {
    id: "blush",
    label: "Blush",
    frameBg: CORAL,
    borderColor: INK,
    captionColor: INK,
    tapeColor: CLOUD,
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
    id: "minimal",
    label: "Minimal",
    frameBg: CLOUD,
    borderColor: "#4a4f6e",
    captionColor: "#4a4f6e",
    tapeColor: null,
  },
  {
    id: "marigold-pop",
    label: "Marigold Pop",
    frameBg: MARIGOLD,
    borderColor: INK,
    captionColor: INK,
    tapeColor: CORAL,
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
