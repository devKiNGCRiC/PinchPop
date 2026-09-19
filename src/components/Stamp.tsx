import { useId } from "react";

import { ChakraShapes } from "@/components/Chakra";
import type { ArtMeta } from "@/lib/art";
import { cn } from "@/lib/utils";

interface StampProps {
  art: ArtMeta;
  earned: boolean;
  className?: string;
}

/** A passport stamp for one destination. Collected stamps are inked; the rest are dashed outlines. */
export function Stamp({ art, earned, className }: StampProps) {
  const pathId = useId();
  const color = earned ? art.color : "#8b8fa8";
  const ring = earned
    ? `${art.place.toUpperCase()} · INDIA · ${art.place.toUpperCase()} · INDIA · `
    : "NOT VISITED YET · NOT VISITED YET · ";

  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={`${art.place} stamp, ${earned ? "collected" : "not collected yet"}`}
      className={cn(earned && "-rotate-6", className)}
    >
      <defs>
        <path id={pathId} d="M60 60m-40 0a40 40 0 1 1 80 0a40 40 0 1 1-80 0" />
      </defs>
      <circle
        cx="60"
        cy="60"
        r="56"
        fill={earned ? "#fffdf8" : "none"}
        stroke={color}
        strokeWidth="4"
        strokeDasharray={earned ? undefined : "7 6"}
      />
      <circle cx="60" cy="60" r="49" fill="none" stroke={color} strokeWidth="1.5" />
      <text
        fontFamily="Unbounded, sans-serif"
        fontSize="8.5"
        fontWeight="800"
        fill={color}
        letterSpacing="1"
      >
        <textPath href={`#${pathId}`} textLength="246" lengthAdjust="spacing">
          {ring}
        </textPath>
      </text>
      <g color={color} transform="translate(36 36) scale(0.48)">
        <ChakraShapes spokes={12} />
      </g>
    </svg>
  );
}

interface PostmarkProps {
  place: string;
  date: string;
  className?: string;
}

/** A round post-office cancellation mark: where and when the photo was "sent". */
export function Postmark({ place, date, className }: PostmarkProps) {
  const pathId = useId();
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={className}>
      <defs>
        <path id={pathId} d="M60 60m-39 0a39 39 0 1 1 78 0a39 39 0 1 1-78 0" />
      </defs>
      <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="60" cy="60" r="31" fill="none" stroke="currentColor" strokeWidth="2" />
      <text
        fontFamily="Unbounded, sans-serif"
        fontSize="9"
        fontWeight="800"
        fill="currentColor"
        letterSpacing="1"
      >
        <textPath href={`#${pathId}`} textLength="244" lengthAdjust="spacing">
          {`PINCHPOP · ${place.toUpperCase()} · PINCHPOP · ${place.toUpperCase()} · `}
        </textPath>
      </text>
      <text
        x="60"
        y="64"
        textAnchor="middle"
        fontFamily="Unbounded, sans-serif"
        fontSize="13"
        fontWeight="800"
        fill="currentColor"
      >
        {date}
      </text>
    </svg>
  );
}
