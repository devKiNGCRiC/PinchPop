import { Hand, Puzzle, Stamp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { Art } from "@/components/Art";
import { Chakra } from "@/components/Chakra";
import { HeroPuzzle } from "@/components/HeroPuzzle";
import { Marquee } from "@/components/Marquee";
import { PopLink } from "@/components/PopButton";
import { Polaroid } from "@/components/Polaroid";
import { ART_LIST, getArt } from "@/lib/art";
import { useMemories } from "@/lib/memories";
import { cn } from "@/lib/utils";

interface Step {
  n: number;
  /** The word from the brand line this step delivers on. */
  verb: string;
  body: string;
  Icon: LucideIcon;
  card: string;
  live: boolean;
}

// The three steps follow the tagline and take the flag's three stripes: saffron, white, green.
const STEPS: Step[] = [
  {
    n: 1,
    verb: "Capture",
    body: "Hold both hands up to frame the shot, then pinch to snap it. No mouse, no timer.",
    Icon: Hand,
    card: "bg-saffron text-ink",
    live: false,
  },
  {
    n: 2,
    verb: "Solve",
    body: "Your photo breaks into nine tiles. Drag them back into place before the clock beats you.",
    Icon: Puzzle,
    card: "bg-white text-ink",
    live: true,
  },
  {
    n: 3,
    verb: "Remember",
    body: "Every solve is pinned to your album as a postmarked polaroid and adds a stamp to your passport.",
    Icon: Stamp,
    card: "bg-leaf text-white",
    live: true,
  },
];

const SAMPLES = [
  { artId: "taj", caption: "Agra, 6 am", tilt: -6 },
  { artId: "jaipur", caption: "Pink City, noon", tilt: 3 },
  { artId: "ladakh", caption: "prayer flags, Ladakh", tilt: -2 },
];

export default function HomePage() {
  const memories = useMemories();
  const hasMemories = memories.length > 0;
  const wall = hasMemories
    ? memories.slice(0, 3).map((m, i) => ({
        artId: m.artId,
        caption: getArt(m.artId).caption,
        tilt: [-5, 3, -2][i],
      }))
    : SAMPLES;

  return (
    <>
      <title>PinchPop: capture, solve, remember your travels</title>

      <section className="relative overflow-hidden bg-chakra pt-32 pb-28 text-white sm:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* A slowly turning wheel: progress, and the aperture of a lens. */}
        <Chakra
          spokes={24}
          className="pointer-events-none absolute -top-48 -right-48 size-155 animate-spin-slow text-white/10"
        />
        {/* First light on the horizon, rising behind the ticker. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-44 left-1/2 size-72 -translate-x-1/2 rounded-full border-[3px] border-ink bg-saffron"
        />

        <div className="relative mx-auto grid max-w-280 items-center gap-14 px-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div>
            <h1 className="font-display text-[clamp(44px,9.4vw,116px)] leading-[0.92] font-extrabold tracking-[-0.055em]">
              <span className="block text-saffron">Pinch it.</span>
              <span className="block text-white">Solve it.</span>
              <span className="block text-leaf-light">Flex it.</span>
            </h1>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-white/90 sm:text-xl">
              Frame a travel shot with your hands, pinch to snap it, then piece the picture back
              together. A photobooth for the places you have been.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <PopLink to="/game" tone="saffron" size="lg">
                Play now
              </PopLink>
              <PopLink to="/gallery" tone="white" size="lg">
                Open my album
              </PopLink>
            </div>
            <p className="mt-6 max-w-md text-base text-white/75">
              Camera mode is on the way. Right now you play with your mouse or finger, and every
              solve is saved on this device.
            </p>
          </div>

          <HeroPuzzle />
        </div>
      </section>

      <div className="-mt-7 mb-6">
        <Marquee words={["Agra", "Jaipur", "Kerala", "Ladakh", "more destinations soon"]} />
      </div>

      <section className="mx-auto max-w-280 px-5 py-16 sm:px-6 sm:py-24">
        <h2 className="max-w-xl font-display text-[clamp(30px,5vw,52px)] leading-none font-extrabold tracking-[-0.045em]">
          Capture. Solve. Remember.
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
          Three things PinchPop does with every photo you take.
        </p>
        <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map(({ n, verb, body, Icon, card, live }) => (
            <li key={n} className={cn("sticker-lg relative rounded-4xl p-6 pt-8", card)}>
              <span
                className={cn(
                  "absolute -top-4 right-5 rounded-full border-2 border-ink px-3 py-1 text-sm font-semibold",
                  live ? "bg-ink text-marigold" : "bg-cloud text-ink",
                )}
              >
                {live ? "Playable now" : "Camera mode, soon"}
              </span>
              <div className="flex items-end justify-between">
                <span className="font-display text-7xl leading-none font-extrabold tracking-[-0.08em]">
                  {n}
                </span>
                <span className="flex size-14 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-cloud text-ink shadow-pop-sm">
                  <Icon className="size-7" strokeWidth={2.25} aria-hidden="true" />
                </span>
              </div>
              <h3 className="mt-5 font-display text-2xl leading-tight font-extrabold tracking-[-0.04em]">
                {verb}
              </h3>
              <p className="mt-2 text-lg leading-snug">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="destinations-heading"
        className="mx-auto max-w-280 px-5 pb-20 sm:px-6"
      >
        <h2
          id="destinations-heading"
          className="max-w-xl font-display text-[clamp(28px,4.6vw,48px)] leading-none font-extrabold tracking-[-0.045em]"
        >
          Pick a destination
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
          Each puzzle is a place. Solve it to earn its stamp.
        </p>
        <ul className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {ART_LIST.map((art) => (
            <li key={art.id}>
              <Link
                to={`/game?art=${art.id}`}
                className="pop sticker group block overflow-hidden rounded-3xl bg-white p-2 sm:p-3"
              >
                <Art artId={art.id} decorative className="block aspect-square w-full rounded-2xl" />
                <span className="mt-3 flex items-center gap-2 px-1">
                  <span
                    aria-hidden="true"
                    className={cn("size-3 shrink-0 rounded-full border-2 border-ink", art.swatch)}
                  />
                  <span className="font-display text-lg font-extrabold tracking-[-0.03em]">
                    {art.place}
                  </span>
                </span>
                <span className="block px-1 pb-1 text-sm text-ink-soft">
                  {art.name}, {art.state}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-280 px-5 pb-8 sm:px-6">
        <div className="sticker-lg overflow-hidden rounded-[2.5rem] bg-cloud px-5 py-12 sm:px-12 sm:py-16">
          <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <h2 className="font-display text-[clamp(28px,4.6vw,48px)] leading-none font-extrabold tracking-[-0.045em]">
                {hasMemories ? "Your album is filling up" : "Every solve is pinned to your album"}
              </h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
                {hasMemories
                  ? "Your latest prints. They stay on this device until accounts arrive."
                  : "Finish a puzzle and the polaroid lands in your album, postmarked with the place and the date."}
              </p>
              <div className="mt-8">
                <PopLink to={hasMemories ? "/gallery" : "/game"} tone="chakra" size="lg">
                  {hasMemories ? "Open my album" : "Start your album"}
                </PopLink>
              </div>
            </div>
            <ul className="mx-auto grid w-full max-w-xl grid-cols-3 gap-3 sm:gap-5">
              {wall.map((print, i) => (
                <li key={`${print.artId}-${i}`} className={i === 1 ? "mt-8" : undefined}>
                  <Polaroid
                    artId={print.artId}
                    caption={print.caption}
                    tilt={print.tilt}
                    tape={i === 0}
                    className="[&_figcaption_span]:text-[16px] sm:[&_figcaption_span]:text-[22px]"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
