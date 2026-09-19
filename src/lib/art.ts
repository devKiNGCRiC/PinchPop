/** The illustrated destinations the practice puzzle is cut from, until webcam capture ships. */
export interface ArtMeta {
  id: "taj" | "jaipur" | "kerala" | "ladakh";
  /** The sight itself. */
  name: string;
  /** The place written on the stamp and postmark. */
  place: string;
  state: string;
  /** Handwritten line under the polaroid. */
  caption: string;
  /** Hex used for this destination's passport stamp. */
  color: string;
  /** Tailwind background class for swatches and chips. */
  swatch: string;
}

export const ART_LIST: ArtMeta[] = [
  {
    id: "taj",
    name: "Taj Mahal",
    place: "Agra",
    state: "Uttar Pradesh",
    caption: "Agra, 6 am",
    color: "#ff9933",
    swatch: "bg-saffron",
  },
  {
    id: "jaipur",
    name: "Hawa Mahal",
    place: "Jaipur",
    state: "Rajasthan",
    caption: "Pink City, noon",
    color: "#ff6b5b",
    swatch: "bg-coral",
  },
  {
    id: "kerala",
    name: "Backwaters",
    place: "Kerala",
    state: "Alappuzha",
    caption: "slow boat, Kerala",
    color: "#138808",
    swatch: "bg-leaf",
  },
  {
    id: "ladakh",
    name: "Mountain pass",
    place: "Ladakh",
    state: "Ladakh",
    caption: "prayer flags, Ladakh",
    color: "#1c34a6",
    swatch: "bg-chakra",
  },
];

export type ArtId = ArtMeta["id"];

// Puzzles saved before the destination artwork existed used these ids.
const LEGACY_IDS: Record<string, ArtId> = { blob: "jaipur", sunset: "taj", disco: "kerala" };

export function normalizeArtId(id: string): ArtId {
  const found = ART_LIST.find((art) => art.id === id);
  return found ? found.id : (LEGACY_IDS[id] ?? "taj");
}

export function isArtId(value: string | null): value is ArtId {
  return ART_LIST.some((art) => art.id === value);
}

export function getArt(id: string): ArtMeta {
  const normalized = normalizeArtId(id);
  return ART_LIST.find((art) => art.id === normalized) ?? ART_LIST[0];
}

export function artName(id: string): string {
  return getArt(id).name;
}
