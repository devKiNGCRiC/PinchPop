import type { CSSProperties, ReactNode } from "react";

import { Art } from "@/components/Art";
import { cn } from "@/lib/utils";

interface PolaroidProps {
  artId: string;
  caption: string;
  /** Resting rotation in degrees. */
  tilt?: number;
  tape?: boolean;
  /** Slide in from above like a fresh print (plays once). */
  develop?: boolean;
  className?: string;
  children?: ReactNode;
}

/** An instant print: white frame, thick bottom margin, handwritten caption, optional tape. */
export function Polaroid({
  artId,
  caption,
  tilt = 0,
  tape = false,
  develop = false,
  className,
  children,
}: PolaroidProps) {
  const style = (develop ? { "--tilt": `${tilt}deg` } : { rotate: `${tilt}deg` }) as CSSProperties;

  return (
    <figure
      className={cn(
        "sticker relative w-full rounded-md bg-white p-2.5 pb-3 sm:p-3 sm:pb-4",
        develop && "animate-print-in",
        className,
      )}
      style={style}
    >
      {tape ? (
        <span
          aria-hidden="true"
          className="absolute -top-3 left-1/2 z-10 h-6 w-20 -translate-x-1/2 -rotate-3 border-2 border-ink/70 bg-lemon/90"
        />
      ) : null}
      <Art artId={artId} className="block aspect-square w-full border-2 border-ink" />
      <figcaption className="mt-2 flex min-h-12 flex-col items-center justify-center text-center">
        <span className="font-hand text-[26px] leading-none font-bold text-ink">{caption}</span>
        {children}
      </figcaption>
    </figure>
  );
}
