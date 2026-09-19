import {
  Aperture,
  ChevronDown,
  Grab,
  Hand,
  HandFist,
  Keyboard,
  Lightbulb,
  MousePointer2,
  Smartphone,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { PopLink } from "@/components/PopButton";
import { cn } from "@/lib/utils";

interface Gesture {
  title: string;
  body: string;
  Icon: LucideIcon;
  color: string;
}

// The five gestures of camera mode, in the order you use them. Camera mode is not live yet.
const GESTURES: Gesture[] = [
  {
    title: "Raise both hands",
    body: "The camera starts tracking. The space between your two index fingertips becomes the photo frame.",
    Icon: Hand,
    color: "bg-saffron",
  },
  {
    title: "Pinch both hands together",
    body: "This locks the frame and starts a 3 second countdown. Smile, or don't.",
    Icon: Aperture,
    color: "bg-white",
  },
  {
    title: "Pinch over one piece",
    body: "Pinch a single hand over a puzzle piece to pick it up, then drag it where it belongs.",
    Icon: Grab,
    color: "bg-marigold",
  },
  {
    title: "Release near its spot",
    body: "Let go of the pinch close to the right place and the piece snaps in by itself.",
    Icon: Target,
    color: "bg-white",
  },
  {
    title: "Hold a closed fist",
    body: "When you finish, hold a fist to save the puzzle or to reset the board.",
    Icon: HandFist,
    color: "bg-leaf text-white",
  },
];

interface Control {
  title: string;
  body: string;
  Icon: LucideIcon;
}

const CONTROLS: Control[] = [
  {
    title: "Mouse",
    body: "Drag a tile onto another to swap them. Clicking one tile and then another works too.",
    Icon: MousePointer2,
  },
  {
    title: "Touch",
    body: "Drag with your finger. The page will not scroll while you drag on the board.",
    Icon: Smartphone,
  },
  {
    title: "Keyboard",
    body: "Tab to a tile and press Enter to pick it up. Tab to another tile and press Enter to swap.",
    Icon: Keyboard,
  },
];

const TIPS = [
  "The clock starts on your first swap, so study the picture before you begin.",
  "Every swap costs 40 points. Look at where a tile belongs before you drop it.",
  "Start with tiles that are easy to spot: a sun, a doorway, a flag, a corner.",
  "Peek is free. It does not stop the clock, but it costs no points.",
  "Try all four destinations to earn every stamp and the Grand tour milestone.",
];

const FAQ = [
  {
    q: "Do I need a camera to play?",
    a: "Not right now. Camera mode is still being built, so you play with your mouse, finger or keyboard. When camera mode arrives, your browser will ask for permission first.",
  },
  {
    q: "Where are my polaroids and stamps saved?",
    a: "In this browser, on this device. They stay after you close the tab, but clearing your site data will remove them. Accounts and syncing come later.",
  },
  {
    q: "Which browsers work best?",
    a: "Chrome and Edge are the best supported. Firefox works too. Safari support is limited.",
  },
  {
    q: "Can I play on my phone?",
    a: "Yes. Touch dragging works on phones and tablets. Camera mode is aimed at laptops with a webcam.",
  },
  {
    q: "Why does the timer start late?",
    a: "The clock starts on your first swap, not when the page opens. That gives you time to look at the board.",
  },
  {
    q: "What is a stamp?",
    a: "Each destination has a stamp. Solve that destination once and it is inked in your passport. Collect all four for the Grand tour milestone.",
  },
];

export default function HowToPlayPage() {
  return (
    <div className="mx-auto max-w-280 px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      <title>How to play · PinchPop</title>
      <h1 className="font-display text-[clamp(32px,6vw,64px)] leading-[0.95] font-extrabold tracking-[-0.05em]">
        How to play
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
        Frame a shot, snap it, then put it back together. Two ways to play: your hands (coming soon)
        and your mouse or finger (right now).
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <PopLink to="/game" tone="saffron" size="lg">
          Play now
        </PopLink>
        <PopLink to="/gallery" tone="white" size="lg">
          Open my album
        </PopLink>
      </div>

      <section aria-labelledby="controls-heading" className="mt-20">
        <h2
          id="controls-heading"
          className="font-display text-[clamp(26px,4vw,40px)] leading-tight font-extrabold tracking-[-0.045em]"
        >
          Playing right now
        </h2>
        <p className="mt-3 max-w-xl text-lg text-ink-soft">
          Swap two tiles until the picture is whole again.
        </p>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {CONTROLS.map(({ title, body, Icon }) => (
            <li key={title} className="sticker-lg rounded-3xl bg-white p-6">
              <span className="flex size-12 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-marigold shadow-pop-sm">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-display text-xl font-extrabold tracking-[-0.03em]">
                {title}
              </h3>
              <p className="mt-2 text-lg leading-snug text-ink-soft">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="gestures-heading" className="mt-20">
        <div className="flex flex-wrap items-center gap-3">
          <h2
            id="gestures-heading"
            className="font-display text-[clamp(26px,4vw,40px)] leading-tight font-extrabold tracking-[-0.045em]"
          >
            Camera mode gestures
          </h2>
          <span className="rounded-full border-2 border-ink bg-cloud px-3 py-1 text-sm font-semibold">
            Coming soon
          </span>
        </div>
        <p className="mt-3 max-w-xl text-lg text-ink-soft">
          No mouse, no keyboard. Your hands do everything, in this order.
        </p>
        <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GESTURES.map(({ title, body, Icon, color }, i) => (
            <li key={title} className={cn("sticker-lg rounded-3xl p-6", color)}>
              <div className="flex items-center justify-between">
                <span className="font-display text-5xl leading-none font-extrabold tracking-tighter">
                  {i + 1}
                </span>
                <span className="flex size-12 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-cloud text-ink shadow-pop-sm">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
              </div>
              <h3 className="mt-5 font-display text-xl font-extrabold tracking-[-0.03em]">
                {title}
              </h3>
              <p className="mt-2 text-lg leading-snug">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="scoring-heading" className="mt-20">
        <h2
          id="scoring-heading"
          className="font-display text-[clamp(26px,4vw,40px)] leading-tight font-extrabold tracking-[-0.045em]"
        >
          Score higher
        </h2>
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
          <div className="sticker-lg rounded-3xl bg-cloud p-6">
            <p className="text-lg leading-relaxed">
              You start at <strong className="font-semibold">2000</strong>. Every move costs{" "}
              <strong className="font-semibold">40</strong> and every second costs{" "}
              <strong className="font-semibold">8</strong>. The lowest score is 100.
            </p>
            <p className="mt-4 rounded-2xl border-2 border-ink bg-marigold/40 p-4 text-base">
              Example: 7 moves in 20 seconds is 2000 − 280 − 160 = 1560.
            </p>
          </div>
          <ul className="space-y-3">
            {TIPS.map((tip) => (
              <li
                key={tip}
                className="sticker flex items-start gap-3 rounded-2xl bg-white p-4 text-lg leading-snug"
              >
                <Lightbulb className="mt-0.5 size-6 shrink-0 text-gold" aria-hidden="true" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="mt-20">
        <h2
          id="faq-heading"
          className="font-display text-[clamp(26px,4vw,40px)] leading-tight font-extrabold tracking-[-0.045em]"
        >
          Questions
        </h2>
        <div className="mt-8 max-w-3xl space-y-3">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group sticker rounded-2xl bg-white">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-3 font-display text-lg font-extrabold tracking-[-0.02em] [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown
                  className="size-6 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </summary>
              <p className="px-5 pb-5 text-lg leading-relaxed text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="sticker-lg mt-20 rounded-4xl bg-chakra px-6 py-12 text-center text-white sm:px-12">
        <h2 className="font-display text-[clamp(28px,4.6vw,48px)] leading-none font-extrabold tracking-[-0.045em]">
          Ready? Pick a destination.
        </h2>
        <div className="mt-8">
          <PopLink to="/game" tone="saffron" size="lg">
            Play now
          </PopLink>
        </div>
      </section>
    </div>
  );
}
