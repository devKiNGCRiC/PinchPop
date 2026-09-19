import { GalleryHorizontal } from "lucide-react";

import { PlaceholderCard, StubLayout } from "@/components/PlaceholderCard";

// Empty frames waiting on the wall: dashed outlines, each hung at its own angle.
const FRAMES = ["-rotate-3", "rotate-2 sm:translate-y-3", "-rotate-1", "rotate-3 sm:translate-y-2"];

export default function GalleryPage() {
  return (
    <StubLayout>
      <div aria-hidden="true" className="flex justify-center gap-4 sm:gap-6">
        {FRAMES.map((tilt, i) => (
          <div
            key={i}
            className={`h-24 w-16 rounded-lg border-2 border-dashed border-ink/25 sm:h-32 sm:w-24 ${tilt} ${i > 1 ? "hidden sm:block" : ""}`}
          />
        ))}
      </div>
      <PlaceholderCard
        icon={GalleryHorizontal}
        heading="Gallery coming soon"
        body="Your saved photos will live here once accounts and storage are built."
      />
    </StubLayout>
  );
}
