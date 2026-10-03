export interface StickerIconDef {
  id: string;
  label: string;
  /** Raw <svg> markup, viewBox 0 0 100 100 — used both as a data URI (DOM <img> and canvas
   * drawImage) so the picker, live preview and exported image are always pixel-identical. */
  svg: string;
}

// A soft, muted palette (dusty rose, sage, pale gold, cream) rather than bold cartoon-emoji
// colors — a deliberately quieter, more "aesthetic" look for photo decorations specifically,
// distinct from the bold primary-color "sticker" pop-art style used for the app's own UI chrome.
const OUTLINE = "#4a4f6e";

function svg(inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${inner}</svg>`;
}

function petal(angle: number, fill: string): string {
  return `<ellipse cx="50" cy="28" rx="15" ry="24" fill="${fill}" stroke="${OUTLINE}" stroke-width="2.5" transform="rotate(${angle} 50 50)"/>`;
}

export const STICKER_ICONS: StickerIconDef[] = [
  {
    id: "heart",
    label: "Heart",
    svg: svg(
      `<path d="M50 88 C20 65 5 45 5 28 C5 12 18 3 32 3 C42 3 50 10 50 20 C50 10 58 3 68 3 C82 3 95 12 95 28 C95 45 80 65 50 88 Z" fill="#f0b9c2" stroke="${OUTLINE}" stroke-width="3"/>`,
    ),
  },
  {
    id: "star",
    label: "Star",
    svg: svg(
      `<path d="M50 5 L61 38 L96 38 L68 59 L79 92 L50 71 L21 92 L32 59 L4 38 L39 38 Z" fill="#f0d99b" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/>`,
    ),
  },
  {
    id: "sparkle",
    label: "Sparkle",
    svg: svg(
      `<path d="M50 4 L59 41 L96 50 L59 59 L50 96 L41 59 L4 50 L41 41 Z" fill="#fbf3df" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/>`,
    ),
  },
  {
    id: "flower",
    label: "Flower",
    svg: svg(
      `${[0, 72, 144, 216, 288].map((a) => petal(a, "#fbeedc")).join("")}<circle cx="50" cy="50" r="13" fill="#f0d99b" stroke="${OUTLINE}" stroke-width="2.5"/>`,
    ),
  },
  {
    id: "moon",
    label: "Moon",
    svg: svg(
      `<path d="M55 8 A42 42 0 1 0 55 92 A32 32 0 1 1 55 8 Z" fill="#f6e9b8" stroke="${OUTLINE}" stroke-width="3"/>`,
    ),
  },
  {
    id: "cloud",
    label: "Cloud",
    svg: svg(
      `<ellipse cx="33" cy="62" rx="24" ry="19" fill="#d6e6f5" stroke="${OUTLINE}" stroke-width="2.5"/><ellipse cx="60" cy="50" rx="28" ry="23" fill="#d6e6f5" stroke="${OUTLINE}" stroke-width="2.5"/><ellipse cx="80" cy="63" rx="19" ry="16" fill="#d6e6f5" stroke="${OUTLINE}" stroke-width="2.5"/>`,
    ),
  },
  {
    id: "leaf",
    label: "Leaf",
    svg: svg(
      `<path d="M50 8 C82 20 88 62 50 92 C12 62 18 20 50 8 Z" fill="#bcd9a8" stroke="${OUTLINE}" stroke-width="3"/><path d="M50 16 L50 84" stroke="${OUTLINE}" stroke-width="2.5"/>`,
    ),
  },
  {
    id: "bow",
    label: "Bow",
    svg: svg(
      `<polygon points="50,50 12,22 12,78" fill="#e3b4bb" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/><polygon points="50,50 88,22 88,78" fill="#e3b4bb" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/><rect x="41" y="37" width="18" height="26" rx="5" fill="#e3b4bb" stroke="${OUTLINE}" stroke-width="3"/>`,
    ),
  },
];

function svgDataUri(markup: string): string {
  return `data:image/svg+xml,${encodeURIComponent(markup)}`;
}

export function stickerIconDataUri(id: string): string {
  const icon = STICKER_ICONS.find((i) => i.id === id);
  return svgDataUri(icon?.svg ?? STICKER_ICONS[0].svg);
}
