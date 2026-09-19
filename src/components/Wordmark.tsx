import { Chakra } from "@/components/Chakra";
import { cn } from "@/lib/utils";

interface WordmarkProps {
  className?: string;
  /** Hide the type and show only the mark. */
  markOnly?: boolean;
}

/** A tilted chakra-blue sticker holding a spoked wheel (Ashoka Chakra and camera aperture in one). */
export function Wordmark({ className, markOnly = false }: WordmarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 -rotate-6 items-center justify-center rounded-xl border-[2.5px] border-ink bg-chakra shadow-pop-sm"
      >
        <Chakra spokes={12} className="size-6 text-white" />
      </span>
      {markOnly ? null : (
        <span className="font-display text-[19px] leading-none font-extrabold tracking-[-0.04em]">
          PinchPop
        </span>
      )}
    </span>
  );
}
