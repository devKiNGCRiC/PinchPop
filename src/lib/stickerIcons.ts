import { lighten } from "@/lib/color";
import { tapeStripInner } from "@/lib/tapeArt";

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
// Every fill is a subtle gradient rather than a flat color, for the same reason.
const OUTLINE = "#4a4f6e";

function svg(inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${inner}</svg>`;
}

/** A gradient def (lighter tint → the base color) plus the `url(#id)` fill that uses it. Each
 * icon is its own standalone SVG document, so reusing the same id ("g"/"g2") across different
 * icons is safe — they never share a document. */
function grad(color: string, id = "g"): { def: string; fill: string } {
  return {
    def: `<linearGradient id="${id}" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="${lighten(color, 0.22)}"/><stop offset="1" stop-color="${color}"/></linearGradient>`,
    fill: `url(#${id})`,
  };
}

function petal(angle: number, fill: string): string {
  return `<ellipse cx="50" cy="28" rx="15" ry="24" fill="${fill}" stroke="${OUTLINE}" stroke-width="2.5" transform="rotate(${angle} 50 50)"/>`;
}

function ray(angle: number): string {
  return `<line x1="50" y1="22" x2="50" y2="10" stroke="${OUTLINE}" stroke-width="4" stroke-linecap="round" transform="rotate(${angle} 50 50)"/>`;
}

const heart = grad("#f0b9c2");
const star = grad("#f0d99b");
const sparkle = grad("#fbf3df");
const flowerPetal = grad("#fbeedc");
const flowerCenter = grad("#f0d99b", "g2");
const moon = grad("#f6e9b8");
const cloud = grad("#d6e6f5");
const leaf = grad("#bcd9a8");
const bow = grad("#e3b4bb");
const butterflyWing = grad("#e3c6e8");
const butterflyWing2 = grad("#d6aedd", "g2");
const crown = grad("#f2d98a");
const balloon = grad("#f0b9c2");
const sun = grad("#f6e3a1");
const gem = grad("#cfe0f5");
const musicNote = grad("#d6aedd");
const paw = grad("#dcc6a8");
const metal = grad("#cbd3de");
const pinHead = grad("#e3737e");
const pinPoint = grad("#9aa0ad", "g2");
// Deliberately more saturated than the muted palette above, with a thick white outline instead
// of the dark OUTLINE stroke — reads as a die-cut sticker pasted on paper, for frames modeled on
// bold scrapbook/collage reference photos rather than the soft pastel look used elsewhere.
const hibiscusPetal = grad("#ec5a82");
const hibiscusCenter = grad("#ffb703", "g2");
const satinBow = grad("#9c1f2e");

export const STICKER_ICONS: StickerIconDef[] = [
  {
    id: "heart",
    label: "Heart",
    svg: svg(
      `<defs>${heart.def}</defs><path d="M50 88 C20 65 5 45 5 28 C5 12 18 3 32 3 C42 3 50 10 50 20 C50 10 58 3 68 3 C82 3 95 12 95 28 C95 45 80 65 50 88 Z" fill="${heart.fill}" stroke="${OUTLINE}" stroke-width="3"/>`,
    ),
  },
  {
    id: "star",
    label: "Star",
    svg: svg(
      `<defs>${star.def}</defs><path d="M50 5 L61 38 L96 38 L68 59 L79 92 L50 71 L21 92 L32 59 L4 38 L39 38 Z" fill="${star.fill}" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/>`,
    ),
  },
  {
    id: "sparkle",
    label: "Sparkle",
    svg: svg(
      `<defs>${sparkle.def}</defs><path d="M50 4 L59 41 L96 50 L59 59 L50 96 L41 59 L4 50 L41 41 Z" fill="${sparkle.fill}" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/>`,
    ),
  },
  {
    id: "flower",
    label: "Flower",
    svg: svg(
      `<defs>${flowerPetal.def}${flowerCenter.def}</defs>${[0, 72, 144, 216, 288].map((a) => petal(a, flowerPetal.fill)).join("")}<circle cx="50" cy="50" r="13" fill="${flowerCenter.fill}" stroke="${OUTLINE}" stroke-width="2.5"/>`,
    ),
  },
  {
    id: "moon",
    label: "Moon",
    svg: svg(
      `<defs>${moon.def}</defs><path d="M55 8 A42 42 0 1 0 55 92 A32 32 0 1 1 55 8 Z" fill="${moon.fill}" stroke="${OUTLINE}" stroke-width="3"/>`,
    ),
  },
  {
    id: "cloud",
    label: "Cloud",
    svg: svg(
      `<defs>${cloud.def}</defs><ellipse cx="33" cy="62" rx="24" ry="19" fill="${cloud.fill}" stroke="${OUTLINE}" stroke-width="2.5"/><ellipse cx="60" cy="50" rx="28" ry="23" fill="${cloud.fill}" stroke="${OUTLINE}" stroke-width="2.5"/><ellipse cx="80" cy="63" rx="19" ry="16" fill="${cloud.fill}" stroke="${OUTLINE}" stroke-width="2.5"/>`,
    ),
  },
  {
    id: "leaf",
    label: "Leaf",
    svg: svg(
      `<defs>${leaf.def}</defs><path d="M50 8 C82 20 88 62 50 92 C12 62 18 20 50 8 Z" fill="${leaf.fill}" stroke="${OUTLINE}" stroke-width="3"/><path d="M50 16 L50 84" stroke="${OUTLINE}" stroke-width="2.5"/>`,
    ),
  },
  {
    id: "bow",
    label: "Bow",
    svg: svg(
      `<defs>${bow.def}</defs><polygon points="50,50 12,22 12,78" fill="${bow.fill}" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/><polygon points="50,50 88,22 88,78" fill="${bow.fill}" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/><rect x="41" y="37" width="18" height="26" rx="5" fill="${bow.fill}" stroke="${OUTLINE}" stroke-width="3"/>`,
    ),
  },
  {
    id: "butterfly",
    label: "Butterfly",
    svg: svg(
      `<defs>${butterflyWing.def}${butterflyWing2.def}</defs><ellipse cx="30" cy="35" rx="22" ry="28" fill="${butterflyWing.fill}" stroke="${OUTLINE}" stroke-width="2.5" transform="rotate(-18 30 35)"/><ellipse cx="70" cy="35" rx="22" ry="28" fill="${butterflyWing.fill}" stroke="${OUTLINE}" stroke-width="2.5" transform="rotate(18 70 35)"/><ellipse cx="35" cy="66" rx="14" ry="17" fill="${butterflyWing2.fill}" stroke="${OUTLINE}" stroke-width="2.5" transform="rotate(-10 35 66)"/><ellipse cx="65" cy="66" rx="14" ry="17" fill="${butterflyWing2.fill}" stroke="${OUTLINE}" stroke-width="2.5" transform="rotate(10 65 66)"/><rect x="47" y="24" width="6" height="56" rx="3" fill="${OUTLINE}"/>`,
    ),
  },
  {
    id: "crown",
    label: "Crown",
    svg: svg(
      `<defs>${crown.def}</defs><path d="M15 72 L15 40 L32 55 L50 24 L68 55 L85 40 L85 72 Z" fill="${crown.fill}" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="18" r="6" fill="${crown.fill}" stroke="${OUTLINE}" stroke-width="2.5"/>`,
    ),
  },
  {
    id: "balloon",
    label: "Balloon",
    svg: svg(
      `<defs>${balloon.def}</defs><ellipse cx="50" cy="38" rx="28" ry="34" fill="${balloon.fill}" stroke="${OUTLINE}" stroke-width="3"/><path d="M44 70 L56 70 L50 80 Z" fill="${OUTLINE}"/><path d="M50 80 Q56 90 50 98" stroke="${OUTLINE}" stroke-width="2" fill="none"/>`,
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
      `<defs>${sun.def}</defs>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => ray(a)).join("")}<circle cx="50" cy="50" r="22" fill="${sun.fill}" stroke="${OUTLINE}" stroke-width="3"/>`,
    ),
  },
  {
    id: "gem",
    label: "Gem",
    svg: svg(
      `<defs>${gem.def}</defs><polygon points="50,10 75,35 65,90 35,90 25,35" fill="${gem.fill}" stroke="${OUTLINE}" stroke-width="3" stroke-linejoin="round"/><path d="M25 35 L75 35 M50 10 L35 90 M50 10 L65 90" stroke="${OUTLINE}" stroke-width="1.5"/>`,
    ),
  },
  {
    id: "music-note",
    label: "Music note",
    svg: svg(
      `<defs>${musicNote.def}</defs><ellipse cx="35" cy="80" rx="15" ry="11" fill="${musicNote.fill}" stroke="${OUTLINE}" stroke-width="2.5" transform="rotate(-15 35 80)"/><path d="M48 80 L48 20" stroke="${OUTLINE}" stroke-width="4" stroke-linecap="round"/><path d="M48 20 C72 25 72 42 50 44" fill="none" stroke="${OUTLINE}" stroke-width="4" stroke-linecap="round"/>`,
    ),
  },
  {
    id: "paw",
    label: "Paw print",
    svg: svg(
      `<defs>${paw.def}</defs><ellipse cx="50" cy="68" rx="26" ry="20" fill="${paw.fill}" stroke="${OUTLINE}" stroke-width="2.5"/><ellipse cx="22" cy="40" rx="11" ry="14" fill="${paw.fill}" stroke="${OUTLINE}" stroke-width="2.5"/><ellipse cx="42" cy="20" rx="11" ry="14" fill="${paw.fill}" stroke="${OUTLINE}" stroke-width="2.5"/><ellipse cx="64" cy="20" rx="11" ry="14" fill="${paw.fill}" stroke="${OUTLINE}" stroke-width="2.5"/><ellipse cx="82" cy="42" rx="10" ry="13" fill="${paw.fill}" stroke="${OUTLINE}" stroke-width="2.5"/>`,
    ),
  },
  {
    id: "line-straight",
    label: "Line",
    svg: svg(
      `<line x1="8" y1="88" x2="92" y2="12" stroke="${OUTLINE}" stroke-width="5" stroke-linecap="round"/>`,
    ),
  },
  {
    id: "line-wavy",
    label: "Wavy line",
    svg: svg(
      `<path d="M5,50 Q27,20 50,50 T95,50" fill="none" stroke="#9db4d8" stroke-width="7" stroke-linecap="round"/>`,
    ),
  },
  {
    id: "line-zigzag",
    label: "Zigzag",
    svg: svg(
      `<path d="M5,30 L30,70 L50,30 L70,70 L95,30" fill="none" stroke="#e3b4bb" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`,
    ),
  },
  {
    id: "line-dotted",
    label: "Dotted line",
    svg: svg(
      `<line x1="8" y1="50" x2="92" y2="50" stroke="${OUTLINE}" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 14"/>`,
    ),
  },
  {
    id: "arrow",
    label: "Arrow",
    svg: svg(
      `<line x1="10" y1="80" x2="80" y2="20" stroke="${OUTLINE}" stroke-width="5" stroke-linecap="round"/><polygon points="80,20 62,24 76,38" fill="${OUTLINE}"/>`,
    ),
  },
  {
    id: "tape",
    label: "Tape",
    svg: svg(
      `<g transform="translate(5 30) rotate(-4 45 20)">${tapeStripInner(90, 40, "#fdf6e3", "#e8dcc0")}</g>`,
    ),
  },
  {
    id: "paperclip",
    label: "Paperclip",
    svg: svg(
      `<defs>${metal.def}</defs><path d="M35 15 L35 70 A15 15 0 0 0 65 70 L65 25 A8 8 0 0 0 49 25 L49 62" fill="none" stroke="${metal.fill}" stroke-width="7" stroke-linecap="round"/>`,
    ),
  },
  {
    id: "pushpin",
    label: "Pushpin",
    svg: svg(
      `<defs>${pinHead.def}${pinPoint.def}</defs><polygon points="50,52 40,82 60,82" fill="${pinPoint.fill}" stroke="${OUTLINE}" stroke-width="1.5"/><circle cx="50" cy="35" r="24" fill="${pinHead.fill}" stroke="${OUTLINE}" stroke-width="2.5"/><circle cx="42" cy="27" r="6" fill="#ffffff" fill-opacity="0.5"/>`,
    ),
  },
  {
    id: "hibiscus",
    label: "Hibiscus",
    svg: svg(
      `<defs>${hibiscusPetal.def}${hibiscusCenter.def}</defs>${[0, 72, 144, 216, 288]
        .map(
          (a) =>
            `<ellipse cx="50" cy="26" rx="19" ry="28" fill="${hibiscusPetal.fill}" stroke="#ffffff" stroke-width="5" transform="rotate(${a} 50 50)"/>`,
        )
        .join(
          "",
        )}<circle cx="50" cy="50" r="12" fill="${hibiscusCenter.fill}" stroke="#ffffff" stroke-width="4"/><line x1="50" y1="50" x2="50" y2="29" stroke="#d7263d" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="27" r="2.5" fill="#d7263d"/>`,
    ),
  },
  {
    id: "satin-bow",
    label: "Satin bow",
    svg: svg(
      `<defs>${satinBow.def}</defs><path d="M50 46 C30 20 5 20 5 42 C5 58 28 54 50 46 Z" fill="${satinBow.fill}" stroke="#3a0d14" stroke-width="2.5" stroke-linejoin="round"/><path d="M50 46 C70 20 95 20 95 42 C95 58 72 54 50 46 Z" fill="${satinBow.fill}" stroke="#3a0d14" stroke-width="2.5" stroke-linejoin="round"/><path d="M50 46 C44 60 40 85 34 96 L46 90 L50 100 L54 90 L66 96 C60 85 56 60 50 46 Z" fill="${satinBow.fill}" stroke="#3a0d14" stroke-width="2.5" stroke-linejoin="round"/><circle cx="50" cy="46" r="10" fill="${satinBow.fill}" stroke="#3a0d14" stroke-width="2.5"/><path d="M20 30 C15 36 15 44 22 48" fill="none" stroke="#ffffff" stroke-opacity="0.45" stroke-width="4" stroke-linecap="round"/><path d="M80 30 C85 36 85 44 78 48" fill="none" stroke="#ffffff" stroke-opacity="0.45" stroke-width="4" stroke-linecap="round"/>`,
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
