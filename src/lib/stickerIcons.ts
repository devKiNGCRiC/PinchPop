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

function ray(angle: number): string {
  return `<line x1="50" y1="22" x2="50" y2="10" stroke="${OUTLINE}" stroke-width="4" stroke-linecap="round" transform="rotate(${angle} 50 50)"/>`;
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
  {
    id: "butterfly",
    label: "Butterfly",
    svg: svg(
      `<ellipse cx="30" cy="35" rx="22" ry="28" fill="#e3c6e8" stroke="${OUTLINE}" stroke-width="2.5" transform="rotate(-18 30 35)"/><ellipse cx="70" cy="35" rx="22" ry="28" fill="#e3c6e8" stroke="${OUTLINE}" stroke-width="2.5" transform="rotate(18 70 35)"/><ellipse cx="35" cy="66" rx="14" ry="17" fill="#d6aedd" stroke="${OUTLINE}" stroke-width="2.5" transform="rotate(-10 35 66)"/><ellipse cx="65" cy="66" rx="14" ry="17" fill="#d6aedd" stroke="${OUTLINE}" stroke-width="2.5" transform="rotate(10 65 66)"/><rect x="47" y="24" width="6" height="56" rx="3" fill="${OUTLINE}"/>`,
    ),
  },
  {
    id: "crown",
    label: "Crown",
    svg: svg(
      `<path d="M15 72 L15 40 L32 55 L50 24 L68 55 L85 40 L85 72 Z" fill="#f2d98a" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="18" r="6" fill="#f2d98a" stroke="${OUTLINE}" stroke-width="2.5"/>`,
    ),
  },
  {
    id: "balloon",
    label: "Balloon",
    svg: svg(
      `<ellipse cx="50" cy="38" rx="28" ry="34" fill="#f0b9c2" stroke="${OUTLINE}" stroke-width="3"/><path d="M44 70 L56 70 L50 80 Z" fill="${OUTLINE}"/><path d="M50 80 Q56 90 50 98" stroke="${OUTLINE}" stroke-width="2" fill="none"/>`,
    ),
  },
  {
    id: "rainbow",
    label: "Rainbow",
    svg: svg(
      `<path d="M8 82 A42 42 0 0 1 92 82" fill="none" stroke="#f0b9c2" stroke-width="10"/><path d="M19 82 A31 31 0 0 1 81 82" fill="none" stroke="#f0d99b" stroke-width="10"/><path d="M30 82 A20 20 0 0 1 70 82" fill="none" stroke="#bcd9a8" stroke-width="10"/>`,
    ),
  },
  {
    id: "sun",
    label: "Sun",
    svg: svg(
      `${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => ray(a)).join("")}<circle cx="50" cy="50" r="22" fill="#f6e3a1" stroke="${OUTLINE}" stroke-width="3"/>`,
    ),
  },
  {
    id: "gem",
    label: "Gem",
    svg: svg(
      `<polygon points="50,10 75,35 65,90 35,90 25,35" fill="#cfe0f5" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/><path d="M25 35 L75 35 M50 10 L35 90 M50 10 L65 90" stroke="${OUTLINE}" stroke-width="1.5"/>`,
    ),
  },
  {
    id: "music-note",
    label: "Music note",
    svg: svg(
      `<ellipse cx="35" cy="80" rx="15" ry="11" fill="#d6aedd" stroke="${OUTLINE}" stroke-width="2.5" transform="rotate(-15 35 80)"/><path d="M48 80 L48 20" stroke="${OUTLINE}" stroke-width="4" stroke-linecap="round"/><path d="M48 20 C72 25 72 42 50 44" fill="none" stroke="${OUTLINE}" stroke-width="4" stroke-linecap="round"/>`,
    ),
  },
  {
    id: "paw",
    label: "Paw print",
    svg: svg(
      `<ellipse cx="50" cy="68" rx="26" ry="20" fill="#dcc6a8" stroke="${OUTLINE}" stroke-width="2.5"/><ellipse cx="22" cy="40" rx="11" ry="14" fill="#dcc6a8" stroke="${OUTLINE}" stroke-width="2.5"/><ellipse cx="42" cy="20" rx="11" ry="14" fill="#dcc6a8" stroke="${OUTLINE}" stroke-width="2.5"/><ellipse cx="64" cy="20" rx="11" ry="14" fill="#dcc6a8" stroke="${OUTLINE}" stroke-width="2.5"/><ellipse cx="82" cy="42" rx="10" ry="13" fill="#dcc6a8" stroke="${OUTLINE}" stroke-width="2.5"/>`,
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
