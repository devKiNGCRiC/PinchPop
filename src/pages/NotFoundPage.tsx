import { Compass } from "lucide-react";

import { PopLink } from "@/components/PopButton";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-280 flex-col items-center px-5 pt-32 pb-8 text-center sm:px-6 sm:pt-40">
      <title>Page not found · PinchPop</title>
      <div className="relative">
        <p
          aria-hidden="true"
          className="font-display text-[clamp(96px,26vw,260px)] leading-[0.85] font-extrabold tracking-[-0.08em] text-chakra"
        >
          404
        </p>
        <span className="sticker-lg absolute -right-4 -bottom-4 flex size-20 rotate-12 items-center justify-center rounded-full bg-saffron sm:size-28">
          <Compass className="size-10 sm:size-14" strokeWidth={2.2} aria-hidden="true" />
        </span>
      </div>
      <h1 className="mt-8 font-display text-[clamp(26px,4.4vw,44px)] leading-tight font-extrabold tracking-[-0.045em]">
        Page not found.
      </h1>
      <p className="mt-3 max-w-md text-lg leading-relaxed text-ink-soft">
        We could not find that page. Head back home and pick a destination.
      </p>
      <div className="mt-8">
        <PopLink to="/" tone="saffron" size="lg">
          Back to home
        </PopLink>
      </div>
    </div>
  );
}
