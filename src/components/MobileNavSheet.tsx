import { Menu } from "lucide-react";
import { NavLink } from "react-router-dom";

import { NAV_LINKS } from "@/components/nav-links";
import { Wordmark } from "@/components/Wordmark";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const CARD_COLORS = ["bg-lemon", "bg-bubble", "bg-mint", "bg-cloud"];

export function MobileNavSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open navigation menu"
          className="pop flex size-11 items-center justify-center rounded-full border-[2.5px] border-ink bg-lemon shadow-pop-sm"
        >
          <Menu className="size-5 text-ink" strokeWidth={2.5} aria-hidden="true" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[86%] border-l-[3px] border-ink bg-lilac text-ink data-[side=right]:sm:max-w-sm"
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className="px-5 pt-5" aria-hidden="true">
          <Wordmark />
        </div>
        <nav aria-label="Primary" className="mt-2 flex flex-col gap-3 px-5">
          {NAV_LINKS.map((link, i) => (
            <SheetClose asChild key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  cn(
                    "pop sticker flex min-h-16 items-center justify-between rounded-2xl px-5 font-display text-xl font-extrabold tracking-[-0.03em]",
                    CARD_COLORS[i % CARD_COLORS.length],
                    isActive && "ring-4 ring-ink ring-offset-2 ring-offset-lilac",
                  )
                }
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
