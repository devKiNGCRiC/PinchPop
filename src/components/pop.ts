import { cn } from "@/lib/utils";

const TONES = {
  lemon: "bg-lemon text-ink",
  pink: "bg-bubble text-ink",
  mint: "bg-mint text-ink",
  white: "bg-cloud text-ink",
  ultra: "bg-ultra text-white",
} as const;

const SIZES = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-6 text-base",
  lg: "h-14 px-8 text-lg",
} as const;

export type PopTone = keyof typeof TONES;
export type PopSize = keyof typeof SIZES;

/** Class recipe for the chunky sticker button used everywhere: outlined, hard-shadowed, pressable. */
export function popButtonClass(tone: PopTone = "lemon", size: PopSize = "md", extra?: string) {
  return cn(
    "pop sticker inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-sans font-semibold whitespace-nowrap select-none disabled:pointer-events-none disabled:opacity-50",
    TONES[tone],
    SIZES[size],
    extra,
  );
}
