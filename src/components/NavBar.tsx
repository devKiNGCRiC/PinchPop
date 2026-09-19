import { NavLink, useLocation } from "react-router-dom";

import { MobileNavSheet } from "@/components/MobileNavSheet";
import { PopLink } from "@/components/PopButton";
import { NAV_LINKS } from "@/components/nav-links";
import { Wordmark } from "@/components/Wordmark";
import { cn } from "@/lib/utils";

export function NavBar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <div className="sticker mx-auto flex h-16 max-w-[1120px] items-center justify-between rounded-full bg-cloud pr-2.5 pl-4 sm:pl-5">
        <NavLink
          to="/"
          end
          aria-label="PinchPop home"
          className="-mx-1 inline-flex h-11 items-center rounded-full px-1 text-ink"
        >
          <Wordmark />
        </NavLink>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "inline-flex h-10 items-center rounded-full border-2 px-4 text-[15px] font-semibold transition-colors",
                  isActive
                    ? "border-ink bg-lemon text-ink"
                    : "border-transparent text-ink-soft hover:border-ink hover:bg-lilac hover:text-ink",
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {pathname === "/game" ? null : (
            <PopLink to="/game" tone="ultra" size="sm" className="hidden sm:inline-flex">
              Play now
            </PopLink>
          )}
          <div className="md:hidden">
            <MobileNavSheet />
          </div>
        </div>
      </div>
    </header>
  );
}
