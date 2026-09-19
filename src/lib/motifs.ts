import type { CSSProperties } from "react";

/** Halftone dot-grid texture: a pure CSS radial-gradient, no image asset (DESIGN.md §10). */
export const HALFTONE: CSSProperties = {
  backgroundImage: "radial-gradient(#221a14 1px, transparent 1px)",
  backgroundSize: "16px 16px",
};

/** A print's final resting rotation, read by the `eject` keyframes in index.css. */
export function printRotation(deg: number): CSSProperties {
  return { "--print-rot": `${deg}deg` } as CSSProperties;
}
