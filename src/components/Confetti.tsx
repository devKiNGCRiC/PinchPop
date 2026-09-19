import type { CSSProperties } from "react";

const COLORS = ["bg-lemon", "bg-bubble", "bg-mint", "bg-tang", "bg-cloud", "bg-ultra"];
const PIECES = 44;

// Deterministic pseudo-random so a render is pure: same index, same piece.
function unit(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** A one-shot burst from the centre of its (relatively positioned) parent. Remount to replay. */
export function Confetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 overflow-visible">
      {Array.from({ length: PIECES }, (_, i) => {
        const angle = unit(i + 1) * Math.PI * 2;
        const distance = 140 + unit(i + 50) * 220;
        return (
          <span
            key={i}
            className={`absolute top-1/2 left-1/2 h-3.5 w-2 animate-confetti rounded-[2px] border border-ink ${COLORS[i % COLORS.length]}`}
            style={
              {
                "--cx": `${Math.cos(angle) * distance}px`,
                "--cy": `${Math.sin(angle) * distance - 60}px`,
                "--cr": `${unit(i + 99) * 720 - 360}deg`,
                animationDelay: `${unit(i + 7) * 120}ms`,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
