import { Outlet } from "react-router-dom";

import { NavBar } from "@/components/NavBar";
import { Separator } from "@/components/ui/separator";

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Separator className="bg-paper-border/20" />
      <footer className="py-4 text-center opacity-30">
        <p className="font-mono text-xs tracking-wide text-paper-warm uppercase">PinchPop</p>
      </footer>
    </div>
  );
}
