import { Outlet, ScrollRestoration } from "react-router-dom";

import { NavBar } from "@/components/NavBar";
import { Wordmark } from "@/components/Wordmark";

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <a
        href="#main"
        className="sr-only z-50 rounded-xl bg-shutter px-4 py-3 font-sans text-base font-semibold text-shutter-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <NavBar />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-ink text-paper">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <Wordmark className="text-paper/70 [&_span]:text-[18px]" />
          <p className="font-mono text-[13px] leading-[1.4] font-normal tracking-[0.08em] text-paper/50 uppercase">
            Best in Chrome or Edge
          </p>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  );
}
