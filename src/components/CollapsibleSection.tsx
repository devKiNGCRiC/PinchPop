import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

interface CollapsibleSectionProps {
  title: string;
  /** Shown next to the title, e.g. the currently chosen option's label. */
  summary?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

/** A native <details>/<summary> disclosure, styled to match the app — no extra dependency for
 * what's fundamentally just "tap to expand." Keeps several picker rows from all being visible
 * (and overwhelming) at once. */
export function CollapsibleSection({
  title,
  summary,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  return (
    <details
      open={defaultOpen}
      className="sticker group rounded-2xl border-2 border-ink bg-white [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <span className="flex items-baseline gap-2">
          <span className="font-semibold">{title}</span>
          {summary ? <span className="text-sm text-ink-soft">{summary}</span> : null}
        </span>
        <ChevronDown
          className="size-5 shrink-0 text-ink-soft transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <div className="border-t-2 border-ink/10 px-4 py-4">{children}</div>
    </details>
  );
}
