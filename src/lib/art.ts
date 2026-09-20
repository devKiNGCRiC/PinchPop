/** The illustrated destinations the practice puzzle is cut from, plus the player's own camera shots. */
export type ArtId = "taj" | "jaipur" | "kerala" | "ladakh";
/** Anything a saved run can be "of": a destination, or a photo taken in camera mode. */
export type PlaceId = ArtId | "camera";

export interface ArtMeta {
  id: PlaceId;
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

export interface DestinationMeta extends ArtMeta {
  id: ArtId;
}

export const ART_LIST: DestinationMeta[] = [
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

/** Photos taken with the webcam in camera mode. Not a destination, so it earns no passport stamp. */
export const CAMERA_META: ArtMeta = {
  id: "camera",
  name: "Your photo",
  place: "Camera",
  state: "Live camera",
  caption: "your shot",
  color: "#111426",
  swatch: "bg-ink",
};

/** Every filterable kind of run: the four destinations, then camera shots. */
export const PLACE_LIST: ArtMeta[] = [...ART_LIST, CAMERA_META];

export const CAMERA_ID = "camera";

// Puzzles saved before the destination artwork existed used these ids.
const LEGACY_IDS: Record<string, ArtId> = { blob: "jaipur", sunset: "taj", disco: "kerala" };

export function isCameraId(id: string): boolean {
  return id === CAMERA_ID;
}

export function normalizeArtId(id: string): ArtId {
  const found = ART_LIST.find((art) => art.id === id);
  return found ? found.id : (LEGACY_IDS[id] ?? "taj");
}

export function isArtId(value: string | null): value is ArtId {
  return ART_LIST.some((art) => art.id === value);
}

export function getArt(id: string): ArtMeta {
  if (isCameraId(id)) return CAMERA_META;
  const normalized = normalizeArtId(id);
  return ART_LIST.find((art) => art.id === normalized) ?? ART_LIST[0];
}

export function artName(id: string): string {
  return getArt(id).name;
}
