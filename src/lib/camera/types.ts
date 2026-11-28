/** A hand landmark in MediaPipe's normalised image space (0..1, origin top-left, un-mirrored). */
export interface Landmark {
  x: number;
  y: number;
}

/** A point in MediaPipe's hand-centred 3D space, in metres. */
export interface WorldLandmark {
  x: number;
  y: number;
  z: number;
}

/** The 21 landmarks of one detected hand, plus their real-world 3D positions when available.
 * The 3D ones don't change with how far the hand is from the camera or how it's turned. */
export type Hand = Landmark[] & { world?: WorldLandmark[] };

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
