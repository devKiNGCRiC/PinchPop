export interface CaptionFont {
  id: string;
  label: string;
  /** CSS font-family value — used for both the live preview and the canvas export, so the two
   * always render identically. */
  family: string;
  /** Preview-only class so each option in the picker shows in its own actual typeface. */
  previewClass?: string;
}

export const DEFAULT_CAPTION_FONT_ID = "hand";

export const CAPTION_FONTS: CaptionFont[] = [
  { id: "hand", label: "Handwritten", family: '"Caveat", cursive' },
  { id: "script", label: "Script", family: '"Dancing Script", cursive' },
  { id: "serif", label: "Elegant", family: '"Playfair Display", serif' },
  { id: "sans", label: "Clean", family: '"Bricolage Grotesque", system-ui, sans-serif' },
];

export function captionFontFor(id: string): CaptionFont {
  return CAPTION_FONTS.find((f) => f.id === id) ?? CAPTION_FONTS[0];
}

export const DEFAULT_CAPTION_SIZE = 26;
export const MIN_CAPTION_SIZE = 16;
export const MAX_CAPTION_SIZE = 40;

/** "plain" is the caption on its own, no background. "tape" sits it on a rotated strip, like a
 * hand-placed label — the color is a separate, freely chosen setting (see CaptionStylePicker). */
export type CaptionBackground = "plain" | "tape";

export const DEFAULT_CAPTION_BACKGROUND: CaptionBackground = "plain";
export const DEFAULT_CAPTION_BG_COLOR = "#ffc61a";
