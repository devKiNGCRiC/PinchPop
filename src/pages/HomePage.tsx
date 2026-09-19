import { Camera, Hand, Puzzle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { HeroPuzzle } from "@/components/HeroPuzzle";
import { Marquee } from "@/components/Marquee";
import { PopLink } from "@/components/PopButton";
import { Polaroid } from "@/components/Polaroid";
import { artName } from "@/lib/art";
import { useMemories } from "@/lib/memories";
import { cn } from "@/lib/utils";

interface Step {
  n: number;
  title: string;
  body: string;
  Icon: LucideIcon;
  color: string;
  tilt: string;
  live: boolean;
}

const STEPS: Step[] = [
  {
    n: 1,
    title: "Frame it",
    body: "Hold both hands up. Your index fingers stretch a frame across the shot.",
    Icon: Hand,
    color: "bg-bubble",
    tilt: "md:-rotate-2",
    live: false,
  },
  {
    n: 2,
    title: "Pinch to snap",
    body: "Bring thumb and index finger together and the booth fires. No mouse, no timer.",
    Icon: Camera,
    color: "bg-mint",
    tilt: "md:rotate-1",
    live: false,
  },
  {
    n: 3,
    title: "Solve the pic",
    body: "Your photo shatters into nine tiles. Drag them back into place, fast as you can.",
    Icon: Puzzle,
    color: "bg-lemon",
    tilt: "md:-rotate-1",
    live: true,
  },
];

const SAMPLES = [
  { artId: "blob", caption: "your face here", tilt: -6 },
  { artId: "sunset", caption: "no cap, solved", tilt: 3 },
  { artId: "disco", caption: "main character", tilt: -2 },
];

export default function HomePage() {
  const memories = useMemories();
  const hasMemories = memories.length > 0;
  const wall = hasMemories
    ? memories.slice(0, 3).map((m, i) => ({
        artId: m.artId,
        caption: artName(m.artId),
        tilt: [-5, 3, -2][i],
      }))
    : SAMPLES;

  return (
    <>
      <title>PinchPop: pinch it, solve it, flex it</title>

      <section className="relative overflow-hidden bg-ultra pt-32 pb-28 text-white sm:pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-28 -right-28 size-64 rounded-full border-[3px] border-ink bg-bubble lg:-top-24 lg:-right-24 lg:size-[420px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 -left-40 size-[340px] rounded-full border-[3px] border-ink bg-mint"
        />

        <div className="relative mx-auto grid max-w-[1120px] items-center gap-14 px-5 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div>
            <h1 className="font-display text-[clamp(44px,9.4vw,116px)] leading-[0.92] font-extrabold tracking-[-0.055em]">
              <span className="block">Pinch it.</span>
              <span className="block text-lemon">Solve it.</span>
              <span className="block text-bubble">Flex it.</span>
            </h1>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-white/90 sm:text-xl">
              Frame a shot with your hands, pinch to snap it, then put the puzzle back together. The
              photobooth you control without touching a thing.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <PopLink to="/game" tone="lemon" size="lg">
                Play now
              </PopLink>
              <PopLink to="/gallery" tone="white" size="lg">
                See the gallery
              </PopLink>
            </div>
            <p className="mt-6 max-w-md text-base text-white/75">
              Camera mode is on the way. Right now you play with your mouse or finger, and every
              solve is saved as a polaroid on this device.
            </p>
          </div>

          <HeroPuzzle />
        </div>
      </section>

      <div className="-mt-7 mb-6">
        <Marquee words={["Pinch", "Snap", "Solve", "Flex", "Repeat"]} />
      </div>

      <section className="mx-auto max-w-[1120px] px-5 py-16 sm:px-6 sm:py-24">
        <h2 className="max-w-xl font-display text-[clamp(30px,5vw,52px)] leading-[1] font-extrabold tracking-[-0.045em]">
          Three moves from selfie to souvenir
        </h2>
        <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map(({ n, title, body, Icon, color, tilt, live }) => (
            <li key={n} className={cn("sticker-lg relative rounded-[2rem] p-6 pt-8", color, tilt)}>
              <span
                className={cn(
                  "absolute -top-4 right-5 rounded-full border-2 border-ink px-3 py-1 text-sm font-semibold",
                  live ? "bg-ink text-lemon" : "bg-cloud text-ink",
                )}
              >
                {live ? "Playable now" : "Camera mode, soon"}
              </span>
              <div className="flex items-end justify-between">
                <span className="font-display text-7xl leading-none font-extrabold tracking-[-0.08em]">
                  {n}
                </span>
                <span className="flex size-14 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-cloud shadow-pop-sm">
                  <Icon className="size-7" strokeWidth={2.25} aria-hidden="true" />
                </span>
              </div>
              <h3 className="mt-5 font-display text-2xl leading-tight font-extrabold tracking-[-0.04em]">
                {title}
              </h3>
              <p className="mt-2 text-lg leading-snug">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-[1120px] px-5 pb-8 sm:px-6">
        <div className="sticker-lg overflow-hidden rounded-[2.5rem] bg-cloud px-5 py-12 sm:px-12 sm:py-16">
          <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <h2 className="font-display text-[clamp(28px,4.6vw,48px)] leading-[1] font-extrabold tracking-[-0.045em]">
                {hasMemories ? "Your wall is filling up" : "Every solve becomes a polaroid"}
              </h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-soft">
                {hasMemories
                  ? "These are your latest prints. They live on this device until accounts arrive."
                  : "Finish a puzzle and the print lands on your wall. Collect them, beat your time, do it again."}
              </p>
              <div className="mt-8">
                <PopLink to={hasMemories ? "/gallery" : "/game"} tone="pink" size="lg">
                  {hasMemories ? "Open my gallery" : "Start your wall"}
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
                    className="[&_figcaption_span]:text-[18px] sm:[&_figcaption_span]:text-[24px]"
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
