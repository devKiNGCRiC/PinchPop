import { Link } from "react-router-dom";

import { Chakra } from "@/components/Chakra";
import { NAV_LINKS } from "@/components/nav-links";
import { Wordmark } from "@/components/Wordmark";
import { ART_LIST } from "@/lib/art";

const linkClass =
  "inline-flex min-h-11 items-center text-base font-semibold text-white/80 underline-offset-4 transition-colors hover:text-marigold hover:underline";

export function Footer() {
  return (
    <footer className="mt-24 bg-chakra-deep text-white">
      {/* The three stripes of the flag: courage, peace, growth. */}
      <div aria-hidden="true" className="grid h-3 grid-cols-3 border-y-[3px] border-ink">
        <span className="bg-saffron" />
        <span className="bg-white" />
        <span className="bg-leaf" />
      </div>

      <div className="mx-auto grid max-w-280 gap-12 px-5 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Wordmark className="text-white" />
          <p className="mt-5 font-display text-2xl leading-tight font-extrabold tracking-[-0.04em]">
            Capture. Solve. Remember.
          </p>
          <p className="mt-3 max-w-xs text-base leading-relaxed text-white/75">
            A gesture-controlled photobooth for the places you have been.
          </p>
        </div>

        <nav aria-labelledby="footer-explore">
          <h2 id="footer-explore" className="font-display text-base font-extrabold text-marigold">
            Explore
          </h2>
          <ul className="mt-3">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-labelledby="footer-destinations">
          <h2
            id="footer-destinations"
            className="font-display text-base font-extrabold text-marigold"
          >
            Destinations
          </h2>
          <ul className="mt-3">
            {ART_LIST.map((art) => (
              <li key={art.id}>
                <Link to={`/game?art=${art.id}`} className={linkClass}>
                  {art.place}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-base font-extrabold text-marigold">Good to know</h2>
          <ul className="mt-3 space-y-3 text-base leading-snug text-white/80">
            <li>Works best in Chrome or Edge.</li>
            <li>Camera mode is on the way. For now, play with mouse or touch.</li>
            <li>Your polaroids and stamps stay in this browser.</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-280 flex-col items-start justify-between gap-3 px-5 py-6 text-sm text-white/65 sm:flex-row sm:items-center sm:px-6">
          <p className="flex items-center gap-2.5">
            <Chakra spokes={24} className="size-6 text-marigold" />© 2026 PinchPop
          </p>
          <p>All destination artwork is illustrated for PinchPop.</p>
        </div>
      </div>
    </footer>
  );
}
