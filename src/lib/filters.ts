export interface FilterPreset {
  id: string;
  label: string;
  /** A CSS filter() value, applied to the on-screen preview and baked into the exported image. */
  css: string;
}

export const DEFAULT_FILTER_ID = "default";

export const FILTER_PRESETS: FilterPreset[] = [
  { id: "default", label: "Default", css: "none" },
  {
    id: "vintage",
    label: "Vintage",
    css: "sepia(0.4) saturate(1.3) contrast(1.05) brightness(0.95)",
  },
  { id: "modern", label: "Modern", css: "contrast(1.2) saturate(1.3) brightness(1.03)" },
  { id: "clear", label: "Clear", css: "contrast(1.08) brightness(1.1) saturate(0.9)" },
  { id: "natural", label: "Natural", css: "saturate(1.05) contrast(1.02) brightness(1.01)" },
  {
    id: "travel",
    label: "Travel",
    css: "saturate(1.45) contrast(1.12) brightness(1.02) hue-rotate(-4deg)",
  },
  { id: "hd", label: "HD", css: "contrast(1.15) saturate(1.08) brightness(1.02)" },
];

export function filterCssFor(id: string): string {
  return FILTER_PRESETS.find((preset) => preset.id === id)?.css ?? "none";
}
