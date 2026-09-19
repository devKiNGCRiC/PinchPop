import { cn } from "@/lib/utils";

interface WordmarkProps {
  className?: string;
}

/** Aperture mark + "PinchPop" set in Space Grotesk 700 (DESIGN.md §7). */
export function Wordmark({ className }: WordmarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="size-7 shrink-0">
        <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="16" cy="16" r="5.5" fill="currentColor" />
        <path
          d="M16 3v7M27.3 9.5 21 13M27.3 22.5 21 19M16 29v-7M4.7 22.5 11 19M4.7 9.5 11 13"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-heading text-[22px] leading-none font-bold tracking-[-0.02em]">
        PinchPop
      </span>
    </span>
  );
}
