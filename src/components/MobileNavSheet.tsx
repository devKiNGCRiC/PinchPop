import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/game", label: "Play", end: false },
  { to: "/gallery", label: "Gallery", end: false },
  { to: "/profile", label: "Profile", end: false },
];

export function MobileNavSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
          className="h-11 w-11 text-paper-warm hover:text-signal"
        >
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="border-paper-border bg-ink">
        {/* No visible drawer heading in the visual spec, but Radix Dialog
            requires an accessible name — kept present and screen-reader-only. */}
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <nav className="flex flex-col gap-1 p-4">
          {NAV_LINKS.map((link) => (
            <SheetClose asChild key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className="font-mono text-[13px] leading-[1.4] font-normal tracking-[0.08em] text-paper-warm uppercase"
              >
                {link.label}
              </NavLink>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
