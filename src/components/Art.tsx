import type { CSSProperties } from "react";

import { getArt } from "@/lib/art";
import type { ArtId } from "@/lib/art";

interface ArtProps {
  artId: string;
  className?: string;
  style?: CSSProperties;
  /** Hidden from assistive tech; use when a parent already describes the picture. */
  decorative?: boolean;
}

const INK = "#111426";

// Every scene is flat colour with ink outlines (no gradients or ids), so the same illustration can
// be rendered nine times, once per puzzle tile, without duplicate-id collisions.

function Taj() {
  return (
    <>
      <rect width="300" height="300" fill="#ffb45f" />
      <rect width="300" height="110" fill="#ffd08a" />
      <circle cx="232" cy="78" r="34" fill="#fff1bf" />
      <ellipse cx="70" cy="66" rx="32" ry="9" fill="#fff" opacity="0.6" />
      <ellipse cx="104" cy="58" rx="20" ry="8" fill="#fff" opacity="0.6" />
      {[52, 234].map((x) => (
        <g key={x}>
          <rect x={x} y="120" width="14" height="112" fill="#fff" stroke={INK} strokeWidth="4" />
          <path
            d={`M${x - 2} 120c0-10 9-16 9-26 0 10 9 16 9 26z`}
            fill="#fff"
            stroke={INK}
            strokeWidth="3"
          />
        </g>
      ))}
      <rect x="98" y="150" width="104" height="82" fill="#fff" stroke={INK} strokeWidth="4" />
      <path d="M136 232V192a14 14 0 0 1 28 0V232Z" fill="#1c34a6" stroke={INK} strokeWidth="3" />
      <path
        d="M112 152C108 118 132 104 150 80c18 24 42 38 38 72Z"
        fill="#fff"
        stroke={INK}
        strokeWidth="4"
      />
      <rect x="148" y="58" width="4" height="24" fill={INK} />
      <circle cx="150" cy="58" r="4" fill={INK} />
      <path d="M98 150c0-12 6-18 10-26 4 8 10 14 10 26z" fill="#fff" stroke={INK} strokeWidth="3" />
      <path
        d="M182 150c0-12 6-18 10-26 4 8 10 14 10 26z"
        fill="#fff"
        stroke={INK}
        strokeWidth="3"
      />
      <rect x="40" y="228" width="220" height="16" fill="#fff" stroke={INK} strokeWidth="4" />
      <rect y="250" width="300" height="50" fill="#1c34a6" />
      <rect x="70" y="262" width="160" height="4" fill="#fff" opacity="0.6" />
      <rect x="100" y="276" width="100" height="4" fill="#fff" opacity="0.6" />
      <ellipse cx="18" cy="248" rx="36" ry="30" fill="#138808" stroke={INK} strokeWidth="4" />
      <ellipse cx="286" cy="250" rx="32" ry="28" fill="#138808" stroke={INK} strokeWidth="4" />
    </>
  );
}

// Hawa Mahal: five stepped tiers of arched windows, a cream trim on each, a saffron flag on top.
const TIERS = [
  { x: 30, y: 206, w: 240, h: 74, wx: 44, wy: 222, step: 22, count: 10 },
  { x: 52, y: 160, w: 196, h: 50, wx: 66, wy: 176, step: 22, count: 8 },
  { x: 76, y: 118, w: 148, h: 46, wx: 90, wy: 132, step: 22, count: 6 },
  { x: 104, y: 80, w: 92, h: 42, wx: 114, wy: 92, step: 20, count: 4 },
  { x: 126, y: 52, w: 48, h: 32, wx: 138, wy: 62, step: 18, count: 2 },
];

function Jaipur() {
  return (
    <>
      <rect width="300" height="300" fill="#8ed1f5" />
      <ellipse cx="46" cy="60" rx="34" ry="10" fill="#fff" opacity="0.85" />
      <ellipse cx="248" cy="96" rx="30" ry="9" fill="#fff" opacity="0.85" />
      {TIERS.map((tier) => (
        <g key={tier.y}>
          <rect
            x={tier.x}
            y={tier.y}
            width={tier.w}
            height={tier.h}
            fill="#f08a8a"
            stroke={INK}
            strokeWidth="4"
          />
          <rect
            x={tier.x}
            y={tier.y}
            width={tier.w}
            height="7"
            fill="#fff3e0"
            stroke={INK}
            strokeWidth="3"
          />
          {Array.from({ length: tier.count }, (_, i) => (
            <path
              key={i}
              d={`M${tier.wx + i * tier.step} ${tier.wy + 14}a7 7 0 0 1 14 0v14h-14z`}
              fill="#8f2d3a"
            />
          ))}
        </g>
      ))}
      {[76, 208, 104, 184].map((x, i) => (
        <path
          key={x}
          d={`M${x} ${i < 2 ? 118 : 80}c0-10 6-14 8-20 2 6 8 10 8 20z`}
          fill="#f08a8a"
          stroke={INK}
          strokeWidth="3"
        />
      ))}
      <path
        d="M126 52c0-16 12-22 24-34 12 12 24 18 24 34z"
        fill="#f08a8a"
        stroke={INK}
        strokeWidth="4"
      />
      <rect x="149" y="2" width="2" height="16" fill={INK} />
      <path d="M151 2l22 6-22 6z" fill="#ff9933" stroke={INK} strokeWidth="2" />
      <rect y="280" width="300" height="20" fill="#e0b075" stroke={INK} strokeWidth="4" />
    </>
  );
}

function Palm({ trunk, crown }: { trunk: string; crown: [number, number] }) {
  return (
    <g>
      <path d={trunk} stroke={INK} strokeWidth="7" strokeLinecap="round" fill="none" />
      <g transform={`translate(${crown[0]} ${crown[1]})`}>
        {[-170, -130, -90, -50, -10, 30].map((angle) => (
          <path
            key={angle}
            d="M0 0C16-24 46-24 64-2 42-10 20-8 0 0Z"
            transform={`rotate(${angle})`}
            fill="#138808"
            stroke={INK}
            strokeWidth="3"
          />
        ))}
        <circle cx="0" cy="6" r="5" fill="#7a3b1e" stroke={INK} strokeWidth="2" />
      </g>
    </g>
  );
}

function Kerala() {
  return (
    <>
      <rect width="300" height="300" fill="#ffe29a" />
      <rect y="60" width="300" height="80" fill="#ffd27a" />
      <circle cx="220" cy="92" r="30" fill="#ff9933" />
      <path
        d="M0 152q20-22 40 0 20-26 44 0 22-20 44 0 22-26 46 0 24-22 46 0 22-18 40 0V190H0z"
        fill="#3aa05a"
      />
      <rect y="176" width="300" height="124" fill="#1aa6a0" />
      {[
        [20, 214],
        [190, 208],
        [110, 264],
        [30, 276],
        [220, 270],
      ].map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          d={`M${x} ${y}q12-8 24 0t24 0`}
          stroke="#fff"
          strokeWidth="3"
          opacity="0.55"
          fill="none"
        />
      ))}
      <rect x="86" y="244" width="120" height="6" fill={INK} opacity="0.2" />
      <path d="M62 226h152q16 0 22-16H44q4 16 18 16z" fill="#7a3b1e" stroke={INK} strokeWidth="4" />
      <rect x="84" y="178" width="110" height="32" fill="#f7e1a8" stroke={INK} strokeWidth="4" />
      {[96, 130, 164].map((x) => (
        <rect
          key={x}
          x={x}
          y="188"
          width="18"
          height="12"
          fill="#1c34a6"
          stroke={INK}
          strokeWidth="2"
        />
      ))}
      <path d="M72 180q66-48 132 0z" fill="#c8862f" stroke={INK} strokeWidth="4" />
      <rect x="137" y="124" width="2" height="18" fill={INK} />
      <path d="M139 124l16 5-16 5z" fill="#ff9933" stroke={INK} strokeWidth="2" />
      <Palm trunk="M34 236q-6-70 12-124" crown={[46, 112]} />
      <Palm trunk="M266 238q6-60-6-106" crown={[260, 132]} />
    </>
  );
}

// The five Tibetan-Buddhist prayer-flag colours: blue, white, red, green, yellow.
const FLAG_COLORS = ["#1c34a6", "#ffffff", "#d7263d", "#138808", "#ffc61a"];

function Ladakh() {
  const flags = Array.from({ length: 10 }, (_, i) => {
    const t = 0.07 + i * 0.095;
    const x = (1 - t) ** 2 * 10 + 2 * (1 - t) * t * 150 + t ** 2 * 290;
    const y = (1 - t) ** 2 * 40 + 2 * (1 - t) * t * 144 + t ** 2 * 40;
    return { x, y, color: FLAG_COLORS[i % FLAG_COLORS.length] };
  });

  return (
    <>
      <rect width="300" height="300" fill="#5b8def" />
      <circle cx="238" cy="70" r="26" fill="#fff1bf" />
      <path
        d="M0 210 60 120l50 50 60-80 70 90 60-50v110H0z"
        fill="#8f7fc0"
        stroke={INK}
        strokeWidth="4"
      />
      <path d="M170 90l-18 32 14-8 12 12 10-14z" fill="#fff" />
      <path d="M60 120l-16 26 12-6 10 8 8-20z" fill="#fff" />
      <path
        d="M-10 262 90 172l60 50 60-60 100 90v46H-10z"
        fill="#b5773f"
        stroke={INK}
        strokeWidth="4"
      />
      <path
        d="M40 252q110-18 220 0v20q-110 12-220 0z"
        fill="#1aa6a0"
        stroke={INK}
        strokeWidth="4"
      />
      <rect y="276" width="300" height="24" fill="#8a5a2b" stroke={INK} strokeWidth="4" />
      <path d="M10 40Q150 144 290 40" stroke={INK} strokeWidth="3" fill="none" />
      {flags.map((flag) => (
        <rect
          key={flag.x}
          x={flag.x - 7}
          y={flag.y + 1}
          width="14"
          height="16"
          fill={flag.color}
          stroke={INK}
          strokeWidth="2"
        />
      ))}
    </>
  );
}

function Scene({ artId }: { artId: ArtId }) {
  switch (artId) {
    case "jaipur":
      return <Jaipur />;
    case "kerala":
      return <Kerala />;
    case "ladakh":
      return <Ladakh />;
    default:
      return <Taj />;
  }
}

/** A full 300×300 illustration; unknown or legacy ids resolve to a destination. */
export function Art({ artId, className, style, decorative = false }: ArtProps) {
  const art = getArt(artId);
  return (
    <svg
      viewBox="0 0 300 300"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : `${art.name}, ${art.place}`}
      aria-hidden={decorative ? true : undefined}
      className={className}
      style={style}
    >
      <Scene artId={art.id} />
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
