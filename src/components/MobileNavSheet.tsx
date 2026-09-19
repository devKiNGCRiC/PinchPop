import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";

import { NAV_LINKS } from "@/components/nav-links";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function MobileNavSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
          className="press size-11 rounded-xl text-paper hover:bg-paper/10 hover:text-paper"
        >
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="border-paper/15 bg-ink text-paper">
        {/* Radix Dialog requires an accessible name; the visible heading is the wordmark. */}
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="px-5 pt-5 text-shutter" aria-hidden="true">
          <Wordmark />
        </div>
        <nav aria-label="Primary" className="mt-4 flex flex-col px-2">
          {NAV_LINKS.map((link) => (
            <SheetClose asChild key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "press flex min-h-14 items-center gap-3 rounded-xl px-3 font-mono text-[13px] leading-[1.4] font-normal tracking-[0.08em] uppercase",
                    isActive ? "bg-paper/10 text-paper" : "text-paper/70 hover:bg-paper/5",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      aria-hidden="true"
                      className={cn("size-2 rounded-full", isActive ? "bg-shutter" : "bg-paper/20")}
                    />
                    {link.label}
                  </>
                )}
              </NavLink>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
