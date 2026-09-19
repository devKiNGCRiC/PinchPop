import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface PlaceholderCardProps {
  heading: string;
  body: string;
  icon?: LucideIcon;
  className?: string;
}

/** Flat info card (DESIGN.md §9): static surfaces never lift or rotate, only clickable ones do. */
export function PlaceholderCard({ heading, body, icon: Icon, className }: PlaceholderCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md rounded-2xl border-[1.5px] border-paper-border bg-paper-raised p-6 text-left shadow-xl shadow-ink/8 sm:p-8",
        className,
      )}
    >
      <title>{`${heading} · PinchPop`}</title>
      {Icon ? (
        <span className="flex size-12 items-center justify-center rounded-xl bg-paper">
          <Icon className="size-6 text-ink" aria-hidden="true" />
        </span>
      ) : null}
      <h1
        className={cn(
          "font-heading text-[22px] leading-[1.15] font-bold text-ink md:text-[30px]",
          Icon && "mt-5",
        )}
      >
        {heading}
      </h1>
      <p className="mt-3 font-sans text-base leading-[1.6] font-normal text-ink-soft">{body}</p>
    </div>
  );
}

interface StubLayoutProps {
  children: ReactNode;
}

/** Vertically centers a stub page's content on the paper surface. */
export function StubLayout({ children }: StubLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem-6rem)] flex-col items-center justify-center gap-10 px-4 py-16 sm:py-24">
      {children}
    </div>
  );
}
