import { Outlet, ScrollRestoration } from "react-router-dom";

import { Footer } from "@/components/Footer";
import { NavBar } from "@/components/NavBar";

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-ivory text-ink">
      <a
        href="#main"
        className="pop sticker sr-only z-50 rounded-full bg-marigold px-5 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <NavBar />
      <main id="main" className="-mt-19 flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
