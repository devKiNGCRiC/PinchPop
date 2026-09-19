import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StartPlayingButtonProps {
  className?: string;
}

/** The one primary action (DESIGN.md §8): shutter fill, shutter-ink label, shutter-click feedback. */
export function StartPlayingButton({ className }: StartPlayingButtonProps) {
  return (
    <Button
      asChild
      size="lg"
      className={cn(
        "press press-primary h-12 min-h-11 rounded-2xl px-8 font-sans text-base font-semibold",
        className,
      )}
    >
      <Link to="/game">Start Playing</Link>
    </Button>
  );
}
