/** The illustrated "photos" the practice puzzle is cut from, until webcam capture ships. */
export const ART_LIST = [
  { id: "blob", name: "Blob pal", swatch: "bg-bubble" },
  { id: "sunset", name: "Sunset", swatch: "bg-tang" },
  { id: "disco", name: "Disco", swatch: "bg-ultra" },
] as const;

export type ArtId = (typeof ART_LIST)[number]["id"];

export function isArtId(value: string): value is ArtId {
  return ART_LIST.some((art) => art.id === value);
}

export function artName(id: string): string {
  return ART_LIST.find((art) => art.id === id)?.name ?? "Mystery pic";
}
