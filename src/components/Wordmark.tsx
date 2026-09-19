import { cn } from "@/lib/utils";

interface WordmarkProps {
  className?: string;
  /** Hide the type and show only the mark. */
  markOnly?: boolean;
}

/** A tilted ultraviolet sticker with a lemon aperture, next to the wide "PinchPop" wordmark. */
export function Wordmark({ className, markOnly = false }: WordmarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 -rotate-6 items-center justify-center rounded-xl border-[2.5px] border-ink bg-ultra shadow-pop-sm"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none">
          <circle cx="12" cy="12" r="8" stroke="#ffe53b" strokeWidth="3" />
          <circle cx="12" cy="12" r="2.6" fill="#ff7ac6" />
        </svg>
      </span>
      {markOnly ? null : (
        <span className="font-display text-[19px] leading-none font-extrabold tracking-[-0.04em]">
          PinchPop
        </span>
      )}
    </span>
  );
}
