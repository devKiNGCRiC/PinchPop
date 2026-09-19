import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  body: string;
  children?: ReactNode;
}

/** Three empty print frames waiting on a pinboard, then one clear next step. */
export function EmptyState({ title, body, children }: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center text-center">
      <div aria-hidden="true" className="flex items-end justify-center gap-4">
        <div className="h-28 w-20 -rotate-6 rounded-md border-[2.5px] border-dashed border-ink bg-white/60 sm:h-36 sm:w-28" />
        <div className="h-32 w-24 rotate-2 rounded-md border-[2.5px] border-dashed border-ink bg-marigold/50 sm:h-44 sm:w-32" />
        <div className="h-28 w-20 rotate-6 rounded-md border-[2.5px] border-dashed border-ink bg-white/60 sm:h-36 sm:w-28" />
      </div>
      <h2 className="mt-8 font-display text-[clamp(24px,4vw,36px)] leading-tight font-extrabold tracking-[-0.04em]">
        {title}
      </h2>
      <p className="mt-3 text-lg leading-relaxed text-ink-soft">{body}</p>
      {children ? <div className="mt-7 flex flex-wrap justify-center gap-3">{children}</div> : null}
    </div>
  );
}
