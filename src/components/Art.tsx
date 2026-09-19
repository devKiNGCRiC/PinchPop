import type { CSSProperties } from "react";

import type { ArtId } from "@/lib/art";

interface ArtProps {
  artId: string;
  className?: string;
  style?: CSSProperties;
  /** Hidden from assistive tech; use when a parent already describes the picture. */
  decorative?: boolean;
}

const SPARKLE = "M0-14 4-4 14 0 4 4 0 14-4 4-14 0-4-4Z";

// Flat colour only (no gradients or ids) so the same scene can be rendered nine times,
// once per puzzle tile, without duplicate-id collisions.
function Scene({ artId }: { artId: ArtId }) {
  switch (artId) {
    case "blob":
      return (
        <>
          <rect width="300" height="300" fill="#ff7ac6" />
          <circle cx="42" cy="46" r="26" fill="#ffe53b" />
          <circle cx="262" cy="248" r="34" fill="#5a2bff" />
          <path d="M0 254c40-22 70 22 110 0s70 22 110 0 60 10 80-6v58H0Z" fill="#4df0b0" />
          <path
            d="M150 44c58 0 94 42 94 96 0 56-38 96-94 96S56 196 56 140c0-54 36-96 94-96Z"
            fill="#ffe53b"
            stroke="#16112b"
            strokeWidth="6"
          />
          <rect x="82" y="112" width="60" height="40" rx="16" fill="#16112b" />
          <rect x="158" y="112" width="60" height="40" rx="16" fill="#16112b" />
          <rect x="138" y="124" width="24" height="8" fill="#16112b" />
          <path
            d="M104 186c14 22 78 22 92 0"
            fill="none"
            stroke="#16112b"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <circle cx="90" cy="176" r="10" fill="#ff7ac6" />
          <circle cx="210" cy="176" r="10" fill="#ff7ac6" />
          <path d={SPARKLE} transform="translate(262 52) scale(1.1)" fill="#16112b" />
          <path d={SPARKLE} transform="translate(40 168) scale(.8)" fill="#16112b" />
        </>
      );
    case "sunset":
      return (
        <>
          <rect width="300" height="300" fill="#ff6b2c" />
          <rect y="70" width="300" height="16" fill="#ff7ac6" />
          <rect y="104" width="300" height="12" fill="#ff7ac6" />
          <rect y="130" width="300" height="8" fill="#ff7ac6" />
          <circle cx="150" cy="136" r="84" fill="#ffe53b" stroke="#16112b" strokeWidth="6" />
          <circle cx="238" cy="42" r="14" fill="#ffe53b" />
          <circle cx="52" cy="60" r="9" fill="#ffe53b" />
          <path d="M0 214c50-46 90 20 150-10s90-40 150 6v90H0Z" fill="#5a2bff" />
          <path d="M0 258c60-30 100 14 160-6s90-14 140 10v38H0Z" fill="#16112b" />
          <path d={SPARKLE} transform="translate(60 240) scale(.9)" fill="#4df0b0" />
          <path d={SPARKLE} transform="translate(246 226) scale(.7)" fill="#ffe53b" />
        </>
      );
    default:
      return (
        <>
          <rect width="300" height="300" fill="#5a2bff" />
          <circle cx="150" cy="150" r="140" fill="none" stroke="#3b16d6" strokeWidth="14" />
          <circle cx="150" cy="150" r="104" fill="none" stroke="#ff7ac6" strokeWidth="8" />
          <path d="M150 0v92" stroke="#16112b" strokeWidth="6" />
          <circle cx="150" cy="150" r="66" fill="#4df0b0" stroke="#16112b" strokeWidth="6" />
          <path
            d="M98 128h104M90 158h120M104 188h92M150 84v132M120 90c-12 40-12 88 0 126M180 90c12 40 12 88 0 126"
            stroke="#16112b"
            strokeWidth="4"
            fill="none"
          />
          <path d={SPARKLE} transform="translate(44 48) scale(1.3)" fill="#ffe53b" />
          <path d={SPARKLE} transform="translate(258 70) scale(.9)" fill="#ffe53b" />
          <path d={SPARKLE} transform="translate(52 246) scale(.9)" fill="#ff7ac6" />
          <path d={SPARKLE} transform="translate(250 252) scale(1.2)" fill="#4df0b0" />
          <circle cx="24" cy="150" r="8" fill="#ffe53b" />
          <circle cx="276" cy="150" r="8" fill="#ff7ac6" />
        </>
      );
  }
}

/** A full 300×300 illustration; unknown ids fall back to the disco scene. */
export function Art({ artId, className, style, decorative = false }: ArtProps) {
  return (
    <svg
      viewBox="0 0 300 300"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Puzzle picture"}
      aria-hidden={decorative ? true : undefined}
      className={className}
      style={style}
    >
      <Scene artId={artId as ArtId} />
    </svg>
  );
}

interface ArtTileProps {
  artId: string;
  /** Which cell of the 3×3 this tile shows: 0 (top-left) to 8 (bottom-right). */
  tile: number;
  className?: string;
}

/** One ninth of an illustration, clipped by scaling the whole scene to 300% and offsetting it. */
export function ArtTile({ artId, tile, className }: ArtTileProps) {
  const col = tile % 3;
  const row = Math.floor(tile / 3);
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <Art
        artId={artId}
        decorative
        className="pointer-events-none absolute max-w-none"
        style={{
          width: "300%",
          height: "300%",
          left: `${-col * 100}%`,
          top: `${-row * 100}%`,
        }}
      />
    </div>
  );
}
