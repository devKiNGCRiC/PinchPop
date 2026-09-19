import { Aperture, Camera, GalleryHorizontal } from "lucide-react";

import { Booth } from "@/components/Booth";
import { StartPlayingButton } from "@/components/StartPlayingButton";
import { HALFTONE } from "@/lib/motifs";

const STEPS = [
  {
    marker: "01",
    title: "Frame",
    body: "Raise both hands to your webcam and frame the shot with your fingers — no mouse, no controller.",
    Icon: Aperture,
    offset: "sm:translate-y-0",
  },
  {
    marker: "02",
    title: "Pinch to Capture",
    body: "Bring thumb and index finger together to snap an instant photo.",
    Icon: Camera,
    offset: "sm:translate-y-6",
  },
  {
    marker: "03",
    title: "Solve & Save",
    body: "Drag the scrambled puzzle back together with your hands to reveal your polaroid.",
    Icon: GalleryHorizontal,
    offset: "sm:translate-y-12",
  },
];

export default function HomePage() {
  return (
    <>
      <title>PinchPop — Capture. Solve. Remember.</title>
      <section className="relative overflow-hidden px-4 pt-16 pb-12 text-center sm:pt-24 sm:pb-16">
        <div
          data-motif="halftone"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={HALFTONE}
        />
        <div data-motif="blobs" aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-16 size-72 rounded-full bg-flash-pink/30 blur-3xl md:size-96" />
          <div className="absolute -top-16 -right-20 size-64 rounded-full bg-darkroom-violet/30 blur-3xl md:size-80" />
          <div className="absolute bottom-0 left-1/2 size-56 -translate-x-1/2 translate-y-1/4 rounded-full bg-lens-blue/25 blur-3xl md:size-72" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1200px]">
          <div className="relative mx-auto w-full max-w-2xl">
            <div
              data-motif="corner-brackets"
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
            >
              <div className="absolute -top-4 -left-2 size-8 md:-left-4 border-t-2 border-l-2 border-lens-blue md:size-10" />
              <div className="absolute -top-4 -right-2 size-8 md:-right-4 border-t-2 border-r-2 border-lens-blue md:size-10" />
              <div className="absolute -bottom-4 -left-2 size-8 md:-left-4 border-b-2 border-l-2 border-lens-blue md:size-10" />
              <div className="absolute -right-2 -bottom-4 size-8 md:-right-4 border-r-2 border-b-2 border-lens-blue md:size-10" />
            </div>

            <div className="relative flex items-center justify-center">
              <div
                data-motif="aperture-ring"
                aria-hidden="true"
                className="pointer-events-none absolute opacity-[0.14]"
              >
                <svg viewBox="0 0 400 400" fill="none" className="size-[min(88vw,640px)]">
                  <circle cx="200" cy="200" r="190" stroke="#8B5CF6" strokeWidth="2" />
                  <circle cx="200" cy="200" r="150" stroke="#8B5CF6" strokeWidth="2" />
                  <circle cx="200" cy="200" r="110" stroke="#8B5CF6" strokeWidth="2" />
                </svg>
              </div>
              <h1 className="relative z-10 mx-auto max-w-[15ch] font-heading text-[34px] leading-[1.05] font-bold tracking-[-0.02em] text-balance text-ink md:text-[56px]">
                Capture. Solve. Remember.
              </h1>
            </div>

            <p className="mx-auto mt-6 max-w-xl font-sans text-base leading-[1.6] font-normal text-ink-soft">
              Frame a photo with your hands, pinch to capture it, solve the resulting puzzle with
              gestures, and keep the polaroid-style memory — PinchPop turns your webcam into a
              gesture-controlled photobooth.
            </p>

            <div className="mt-8">
              <StartPlayingButton />
            </div>
          </div>

          <Booth />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1200px] px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="max-w-[16ch] font-heading text-[22px] leading-[1.15] font-bold text-ink md:text-[30px]">
          How PinchPop Works
        </h2>
        <ol className="mt-10 grid gap-6 pb-12 sm:grid-cols-3">
          {STEPS.map(({ marker, title, body, Icon, offset }) => (
            <li
              key={marker}
              className={`flex flex-col rounded-2xl border-[1.5px] border-paper-border bg-paper-raised p-6 shadow-xl shadow-ink/8 ${offset}`}
            >
              <div className="flex items-center justify-between">
                <Icon className="size-6 text-ink" aria-hidden="true" />
                <span className="flex size-9 items-center justify-center rounded-full border-[1.5px] border-paper-border font-mono text-[13px] leading-[1.4] font-normal tracking-[0.08em] text-ink-soft">
                  {marker}
                </span>
              </div>
              <h3 className="mt-6 font-heading text-[22px] leading-[1.15] font-bold text-ink">
                {title}
              </h3>
              <p className="mt-2 font-sans text-base leading-[1.6] font-normal text-ink-soft">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-paper-border">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center gap-6 px-4 py-16 text-center">
          <p className="font-heading text-[22px] leading-[1.15] font-bold text-ink md:text-[30px]">
            Capture. Solve. Remember.
          </p>
          <StartPlayingButton />
        </div>
      </section>
    </>
  );
}
