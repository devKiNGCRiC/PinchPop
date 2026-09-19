import { Grid3x3 } from "lucide-react";

import { PlaceholderCard } from "@/components/PlaceholderCard";

// Four viewfinder corners, drawn once so the bezel reads as "screen inside a machine".
const CORNERS = [
  "top-4 left-4 border-t-2 border-l-2",
  "top-4 right-4 border-t-2 border-r-2",
  "bottom-4 left-4 border-b-2 border-l-2",
  "right-4 bottom-4 border-r-2 border-b-2",
];

export default function GamePage() {
  return (
    <div className="px-4 py-10 sm:py-16">
      <div className="relative mx-auto w-full max-w-[960px] rounded-[28px] bg-ink p-3 shadow-2xl shadow-ink/25 md:p-4">
        <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-[18px] bg-paper px-4 py-12 md:min-h-[520px]">
          <div
            data-motif="puzzle-grid"
            aria-hidden="true"
            className="pointer-events-none absolute inset-8 grid grid-cols-3 grid-rows-3 gap-3 opacity-[0.12] md:inset-12 md:gap-4"
          >
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="rounded-xl border-2 border-ink" />
            ))}
          </div>
          {CORNERS.map((position) => (
            <div
              key={position}
              aria-hidden="true"
              className={`pointer-events-none absolute size-8 border-ink/70 md:size-10 ${position}`}
            />
          ))}
          <PlaceholderCard
            icon={Grid3x3}
            heading="Game screen coming soon"
            body="The gesture capture and puzzle engine lands in the next phase."
            className="relative"
          />
        </div>
        <div className="absolute bottom-1.5 left-1/2 h-1 w-28 -translate-x-1/2 rounded-full bg-paper/20 md:bottom-2" />
      </div>
    </div>
  );
}
