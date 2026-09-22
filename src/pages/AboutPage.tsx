import { Aperture, Camera, HandHeart, Sparkles } from "lucide-react";

import { Chakra } from "@/components/Chakra";
import { PopLink } from "@/components/PopButton";
import { Seo } from "@/components/Seo";

const POINTS = [
  {
    title: "Your hands are the controller",
    body: "Camera mode uses MediaPipe's free, open-source hand tracking, running entirely in your browser. Frame a shot with two fingertips, pinch to snap it, then solve the puzzle by pinching and dragging pieces.",
    Icon: Camera,
  },
  {
    title: "No mouse? No problem",
    body: "Everything camera mode can do also works with a mouse, a finger on a touchscreen, or a keyboard, so the puzzle is playable without a webcam too.",
    Icon: Aperture,
  },
  {
    title: "A photobooth for your travels",
    body: "Each puzzle is a destination. Solve one to pin a postmarked polaroid to your album and ink its stamp into your passport.",
    Icon: Sparkles,
  },
  {
    title: "Built to stay free",
    body: "PinchPop runs on free hosting and a free, in-browser hand-tracking model, with no accounts or servers required to play.",
    Icon: HandHeart,
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-280 px-5 pt-28 pb-8 sm:px-6 sm:pt-32">
      <Seo
        title="About"
        description="What PinchPop is, how the gesture-controlled photobooth works, and the free tools it's built with."
        path="/about"
      />
      <div className="flex flex-wrap items-center gap-4">
        <Chakra spokes={24} className="size-14 shrink-0 text-chakra" />
        <h1 className="font-display text-[clamp(32px,6vw,64px)] leading-[0.95] font-extrabold tracking-tighter">
          About PinchPop
        </h1>
      </div>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
        PinchPop is a gesture-controlled photobooth game. Frame a photo with your hands, pinch to
        capture it, solve the resulting puzzle with gestures, and get back a polaroid-style photo
        memory of the place you "visited".
      </p>

      <ul className="mt-12 grid gap-6 sm:grid-cols-2">
        {POINTS.map(({ title, body, Icon }) => (
          <li key={title} className="sticker-lg rounded-3xl bg-white p-6">
            <span className="flex size-12 items-center justify-center rounded-2xl border-[2.5px] border-ink bg-marigold shadow-pop-sm">
              <Icon className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-display text-xl font-extrabold tracking-tight">{title}</h2>
            <p className="mt-2 text-lg leading-snug text-ink-soft">{body}</p>
          </li>
        ))}
      </ul>

      <section
        aria-labelledby="status-heading"
        className="sticker-lg mt-12 rounded-3xl bg-cloud p-6 sm:p-8"
      >
        <h2 id="status-heading" className="font-display text-2xl font-extrabold tracking-tight">
          Where PinchPop is today
        </h2>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Camera mode, the practice booth, Speed Run scoring, achievements, your album and your
          passport all work right now, saved on this device. Accounts, a cloud gallery and a shared
          online leaderboard are being built next.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <PopLink to="/how-to-play" tone="saffron" size="lg">
          How to play
        </PopLink>
        <PopLink to="/privacy" tone="white" size="lg">
          Privacy
        </PopLink>
      </div>
    </div>
  );
}
