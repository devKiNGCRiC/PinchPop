import { Link } from "react-router-dom";

import { NAV_LINKS } from "@/components/nav-links";

export function Footer() {
  return (
    <footer className="mt-24 overflow-hidden bg-ink text-cloud">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-8 px-5 pt-14 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="max-w-sm">
          <p className="font-display text-2xl leading-tight font-extrabold tracking-[-0.03em]">
            Pinch it. Solve it. Flex it.
          </p>
          <p className="mt-3 text-base leading-relaxed text-cloud/70">
            Best in Chrome or Edge. Camera mode is on the way; until then, play with your mouse or
            finger.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="inline-flex min-h-11 items-center text-base font-semibold text-cloud/80 underline-offset-4 hover:text-lemon hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <p
        aria-hidden="true"
        className="mt-6 -mb-[0.16em] text-center font-display text-[clamp(56px,17vw,240px)] leading-none font-extrabold tracking-[-0.06em] text-ultra select-none"
      >
        PinchPop
      </p>
    </footer>
  );
}
