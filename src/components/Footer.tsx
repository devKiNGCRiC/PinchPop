import { Link } from "react-router-dom";

import { Chakra } from "@/components/Chakra";
import { FOOTER_HELP_LINKS, FOOTER_PLAY_LINKS, FOOTER_YOURS_LINKS } from "@/components/nav-links";
import { SocialLinks } from "@/components/SocialLinks";
import { Wordmark } from "@/components/Wordmark";
import { ART_LIST } from "@/lib/art";
import { CONTACT_EMAIL } from "@/lib/social";

const linkClass =
  "inline-flex min-h-11 items-center text-base font-semibold text-white/80 underline-offset-4 transition-colors hover:text-marigold hover:underline";

const smallLinkClass =
  "inline-flex min-h-11 items-center text-sm font-semibold text-white/70 underline-offset-4 transition-colors hover:text-marigold hover:underline";

interface ColumnLink {
  to: string;
  label: string;
}

function LinkColumn({ id, title, links }: { id: string; title: string; links: ColumnLink[] }) {
  return (
    <nav aria-labelledby={id}>
      <h2 id={id} className="font-display text-base font-extrabold text-marigold">
        {title}
      </h2>
      <ul className="mt-3">
        {links.map((link) => (
          <li key={link.to}>
            <Link to={link.to} className={linkClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 bg-chakra-deep text-white">
      {/* The three stripes of the flag: courage, peace, growth. */}
      <div aria-hidden="true" className="grid h-3 grid-cols-3 border-y-[3px] border-ink">
        <span className="bg-saffron" />
        <span className="bg-white" />
        <span className="bg-leaf" />
      </div>

      <div className="mx-auto grid max-w-280 grid-cols-2 gap-x-6 gap-y-10 px-5 py-14 sm:grid-cols-3 sm:px-6 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_1.2fr]">
        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <Wordmark className="text-white" />
          <p className="mt-5 font-display text-2xl leading-tight font-extrabold tracking-[-0.04em]">
            Capture. Solve. Remember.
          </p>
          <p className="mt-3 max-w-xs text-base leading-relaxed text-white/75">
            A gesture-controlled photobooth for the places you have been.
          </p>
          <SocialLinks className="mt-5 -ml-1.5 text-white/70" />
        </div>

        <LinkColumn id="footer-play" title="Play" links={FOOTER_PLAY_LINKS} />
        <LinkColumn id="footer-yours" title="Your stuff" links={FOOTER_YOURS_LINKS} />
        <LinkColumn
          id="footer-destinations"
          title="Destinations"
          links={ART_LIST.map((art) => ({ to: `/game?art=${art.id}`, label: art.place }))}
        />

        <div className="col-span-2 sm:col-span-3 lg:col-span-1">
          <h2 className="font-display text-base font-extrabold text-marigold">Good to know</h2>
          <ul className="mt-3 space-y-3 text-base leading-snug text-white/80">
            <li>Works best in Chrome or Edge.</li>
            <li>Camera mode uses your webcam and never uploads your video.</li>
            <li>
              No camera? Play the puzzle with mouse or touch. Your polaroids and stamps stay in this
              browser.
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-280 flex-col gap-4 px-5 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-sm text-white/65">
            <p className="flex items-center gap-2.5">
              <Chakra spokes={24} className="size-6 text-marigold" />© 2026 PinchPop
            </p>
            <p className="mt-1">All destination artwork is illustrated for PinchPop.</p>
          </div>
          <nav aria-label="Help and legal">
            <ul className="flex flex-wrap gap-x-5">
              {FOOTER_HELP_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={smallLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className={smallLinkClass}>
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
