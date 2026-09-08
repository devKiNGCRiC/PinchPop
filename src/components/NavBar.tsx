import { NavLink } from "react-router-dom";

import { MobileNavSheet } from "@/components/MobileNavSheet";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/game", label: "Play", end: false },
  { to: "/gallery", label: "Gallery", end: false },
  { to: "/profile", label: "Profile", end: false },
];

export function NavBar() {
  return (
    <header className="h-16 w-full bg-ink">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink
          to="/"
          end
          className="font-mono text-[13px] leading-[1.4] font-normal tracking-[0.08em] text-signal uppercase"
        >
          PINCHPOP
        </NavLink>

        <nav className="hidden md:flex md:items-center md:gap-6">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "border-b-2 font-mono text-[13px] leading-[1.4] font-normal tracking-[0.08em] text-paper-warm uppercase",
                  isActive ? "border-signal" : "border-transparent",
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
