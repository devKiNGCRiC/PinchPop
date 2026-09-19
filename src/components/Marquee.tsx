import { Sparkle } from "lucide-react";

interface MarqueeProps {
  words: string[];
}

/** A slow, tilted ticker band. The second copy is hidden from assistive tech. */
export function Marquee({ words }: MarqueeProps) {
  const row = (hidden: boolean) => (
    <ul
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-6 pr-6 font-display text-[clamp(20px,3.4vw,34px)] font-extrabold tracking-[-0.03em] whitespace-nowrap"
    >
      {words.map((word) => (
        <li key={word} className="flex items-center gap-6">
          {word}
          <Sparkle className="size-6 fill-ink" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="relative z-10 -rotate-2 overflow-hidden border-y-[3px] border-ink bg-lemon py-3 text-ink">
      <div className="flex w-max animate-marquee">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
