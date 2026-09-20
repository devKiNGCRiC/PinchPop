/** A hand landmark in MediaPipe's normalised image space (0..1, origin top-left, un-mirrored). */
export interface Landmark {
  x: number;
  y: number;
}

/** The 21 landmarks of one detected hand. */
export type Hand = Landmark[];

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}
