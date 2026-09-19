import { HALFTONE, printRotation } from "@/lib/motifs";

// The signature gesture, staged: two fingertips pull a framing rectangle across the scene,
// the shutter fires, and prints slide out of the machine's chute. Decorative only — no readouts.
const FRAME_CORNERS = [
  "top-0 left-0 border-t-2 border-l-2",
  "top-0 right-0 border-t-2 border-r-2",
  "bottom-0 left-0 border-b-2 border-l-2",
  "right-0 bottom-0 border-r-2 border-b-2",
];

export function Booth() {
  return (
    <div
      data-motif="card-stack"
      aria-hidden="true"
      className="pointer-events-none relative mx-auto mt-16 w-full max-w-[960px] pb-28 md:pb-36"
    >
      {/* Prints sit behind the cabinet (lower z) so they read as sliding out from under it. */}
      <div className="absolute top-full left-1/2 z-0 -mt-32 md:-mt-40">
        <div
          data-card-stack-item
          className="absolute top-0 h-28 w-40 -translate-x-[150px] animate-eject overflow-hidden rounded-xl bg-paper-raised shadow-lg shadow-ink/15 [animation-delay:900ms] md:h-36 md:w-52 md:-translate-x-[190px]"
          style={printRotation(-6)}
        >
          <div className="absolute inset-0 bg-linear-to-tr from-lens-blue/30 via-darkroom-violet/20 to-flash-pink/20" />
          <div className="absolute top-[20%] right-[18%] size-8 rounded-full bg-paper-raised/90 md:size-10" />
          <div className="absolute -bottom-8 -left-6 h-16 w-40 rounded-[50%] bg-ink/80 md:h-20 md:w-52" />
        </div>
        <div
          data-card-stack-item
          className="absolute top-0 h-28 w-40 translate-x-[-10px] animate-eject overflow-hidden rounded-xl bg-paper-raised shadow-xl shadow-ink/20 [animation-delay:1050ms] md:h-36 md:w-52 md:translate-x-[-6px]"
          style={printRotation(4)}
        >
          <div className="absolute inset-0 bg-linear-to-br from-flash-pink/30 via-darkroom-violet/20 to-lens-blue/25" />
          <div className="absolute top-[18%] left-[20%] size-8 rounded-full bg-paper-raised/90 md:size-10" />
          <div className="absolute -right-6 -bottom-9 h-16 w-44 rounded-[50%] bg-ink/70 md:h-20 md:w-56" />
        </div>
        <div
          data-card-stack-item
          className="absolute top-0 hidden h-24 w-36 translate-x-[150px] animate-eject overflow-hidden rounded-xl bg-paper-raised shadow-lg shadow-ink/15 [animation-delay:1200ms] sm:block md:h-32 md:w-44 md:translate-x-[175px]"
          style={printRotation(9)}
        >
          <div className="absolute inset-0 bg-linear-to-bl from-darkroom-violet/30 to-lens-blue/20" />
          <div className="absolute -bottom-8 -left-4 h-14 w-40 rounded-[50%] bg-ink/60 md:h-16 md:w-48" />
        </div>
      </div>

      {/* Cabinet: the ink bezel around the paper "screen" (DESIGN.md §6). */}
      <div className="relative z-10 rounded-[28px] bg-ink p-3 shadow-2xl shadow-ink/25 md:p-4">
        <span className="absolute top-2 left-2 size-1.5 rounded-full bg-paper/15 md:top-2.5 md:left-2.5" />
        <span className="absolute top-2 right-2 size-1.5 rounded-full bg-paper/15 md:top-2.5 md:right-2.5" />
        <span className="absolute bottom-2 left-2 size-1.5 rounded-full bg-paper/15 md:bottom-2.5 md:left-2.5" />
        <span className="absolute right-2 bottom-2 size-1.5 rounded-full bg-paper/15 md:right-2.5 md:bottom-2.5" />

        <div className="relative h-[300px] overflow-hidden rounded-[18px] bg-paper md:h-[420px]">
          {/* The scene being framed: an abstract dusk landscape built from gradients and shapes. */}
          <div className="absolute inset-0 bg-linear-to-b from-flash-pink/45 via-darkroom-violet/30 to-lens-blue/35" />
          <div data-motif="halftone" className="absolute inset-0 opacity-[0.06]" style={HALFTONE} />
          <div className="absolute top-[16%] right-[24%] size-20 rounded-full bg-paper-raised md:size-28" />
          <div className="absolute -bottom-24 -left-10 h-52 w-[70%] rounded-[50%] bg-ink/90 md:-bottom-32 md:h-72" />
          <div className="absolute -right-16 -bottom-28 h-52 w-[75%] rounded-[50%] bg-ink/70 md:-bottom-36 md:h-72" />
          <div className="absolute -bottom-32 left-[20%] h-44 w-[60%] rounded-[50%] bg-ink/45 md:h-56" />

          {/* The framing rectangle: everything outside it is dimmed, like a crop. */}
          <div className="absolute inset-x-[16%] top-[12%] bottom-[22%] animate-snap shadow-[0_0_0_999px_rgb(34_26_20/0.42)] md:inset-x-[22%]">
            {FRAME_CORNERS.map((corner) => (
              <span
                key={corner}
                className={`absolute size-6 border-paper-raised md:size-8 ${corner}`}
              />
            ))}
            {/* Two fingertips pulling opposite corners — the actual capture gesture. */}
            <span className="absolute -top-3 -left-3 size-6 rounded-full bg-paper-raised shadow-lg ring-4 ring-paper-raised/40 md:-top-4 md:-left-4 md:size-8" />
            <span className="absolute -right-3 -bottom-3 size-6 rounded-full bg-paper-raised shadow-lg ring-4 ring-paper-raised/40 md:-right-4 md:-bottom-4 md:size-8" />
          </div>

          <div className="absolute inset-0 z-20 animate-flash bg-paper-raised [animation-delay:700ms]" />
        </div>

        {/* Print-ejection chute: a physical detail of the machine. */}
        <div className="absolute bottom-1.5 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-paper/20 md:bottom-2" />
      </div>
    </div>
  );
}
