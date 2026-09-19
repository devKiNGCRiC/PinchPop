import { Art } from "@/components/Art";
import { PopLink } from "@/components/PopButton";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-[1120px] flex-col items-center px-5 pt-32 pb-8 text-center sm:px-6 sm:pt-40">
      <title>Page not found · PinchPop</title>
      <div className="relative">
        <p
          aria-hidden="true"
          className="font-display text-[clamp(96px,26vw,260px)] leading-[0.85] font-extrabold tracking-[-0.08em] text-ultra"
        >
          404
        </p>
        <div className="sticker-lg absolute -right-4 -bottom-4 size-20 rotate-12 overflow-hidden rounded-full bg-bubble sm:size-28">
          <Art artId="blob" decorative className="size-full" />
        </div>
      </div>
      <h1 className="mt-8 font-display text-[clamp(26px,4.4vw,44px)] leading-tight font-extrabold tracking-[-0.045em]">
        Page not found.
      </h1>
      <p className="mt-3 max-w-md text-lg leading-relaxed text-ink-soft">
        We couldn't find that page. Head back and keep exploring PinchPop.
      </p>
      <div className="mt-8">
        <PopLink to="/" tone="lemon" size="lg">
          Back to home
        </PopLink>
      </div>
    </div>
  );
}
