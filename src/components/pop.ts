import { cn } from "@/lib/utils";

// Each tone follows the palette's jobs: saffron for the primary action, chakra for structure,
// leaf for "saved / success", marigold to highlight, coral as a friendly secondary, white to stay neutral.
const TONES = {
  saffron: "bg-saffron text-ink",
  marigold: "bg-marigold text-ink",
  coral: "bg-coral text-ink",
  white: "bg-white text-ink",
  chakra: "bg-chakra text-white",
  leaf: "bg-leaf text-white",
} as const;

const SIZES = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-base",
  lg: "h-14 px-8 text-lg",
} as const;

export type PopTone = keyof typeof TONES;
export type PopSize = keyof typeof SIZES;

/** Class recipe for the chunky sticker button used everywhere: outlined, hard-shadowed, pressable. */
export function popButtonClass(tone: PopTone = "saffron", size: PopSize = "md", extra?: string) {
  return cn(
    "pop sticker inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-sans font-semibold whitespace-nowrap select-none disabled:pointer-events-none disabled:opacity-50",
    TONES[tone],
    SIZES[size],
    extra,
  );
}
