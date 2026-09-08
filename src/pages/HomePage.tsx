import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:py-24">
      <h1 className="max-w-3xl text-[32px] leading-[1.1] font-semibold text-paper-warm md:text-[48px]">
        Capture. Solve. Remember.
      </h1>
      <p className="max-w-xl text-base leading-[1.5] text-paper-warm">
        Frame a photo with your hands, pinch to capture it, solve the
        resulting puzzle with gestures, and keep the polaroid-style memory —
        PinchPop turns your webcam into a gesture-controlled photobooth.
      </p>
      <Button asChild size="lg">
        <Link to="/game">Start Playing</Link>
      </Button>
    </div>
  );
}
