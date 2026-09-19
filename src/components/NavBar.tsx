import { NavLink } from "react-router-dom";

import { MobileNavSheet } from "@/components/MobileNavSheet";
import { NAV_LINKS } from "@/components/nav-links";
import { Wordmark } from "@/components/Wordmark";
import { cn } from "@/lib/utils";

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-ink text-paper">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink
          to="/"
          end
          aria-label="PinchPop home"
          className="press -mx-1 inline-flex h-11 items-center rounded-md px-1 text-shutter"
        >
          <Wordmark />
        </NavLink>

        <nav aria-label="Primary" className="hidden md:flex md:items-center md:gap-8">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "relative inline-flex h-16 items-center font-mono text-[13px] leading-[1.4] font-normal tracking-[0.08em] uppercase transition-colors motion-reduce:transition-none",
                  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-transparent after:content-['']",
                  isActive ? "text-paper after:bg-shutter" : "text-paper/65 hover:text-paper",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="md:hidden">
          <MobileNavSheet />
        </div>
      </div>
    </header>
  );
}
