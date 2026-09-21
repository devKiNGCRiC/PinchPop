import { Star, X } from "lucide-react";

import { dismissToast, useToasts } from "@/lib/achievements";

/** Milestone notices: appear the moment a run earns a new badge, then fade after a few seconds. */
export function AchievementToaster() {
  const toasts = useToasts();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-3 bottom-3 z-50 flex w-[min(22rem,calc(100vw-1.5rem))] flex-col gap-3 sm:right-6 sm:bottom-6"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="sticker-lg pointer-events-auto flex items-start gap-3 rounded-2xl bg-marigold p-4 animate-in fade-in slide-in-from-bottom-4 motion-reduce:animate-none"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-cloud">
            <Star className="size-6 fill-marigold" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Milestone unlocked</p>
            <p className="font-display text-lg leading-tight font-extrabold tracking-[-0.03em]">
              {toast.name}
            </p>
            <p className="text-sm leading-snug">{toast.hint}</p>
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label={`Dismiss ${toast.name} notice`}
            className="flex size-9 shrink-0 items-center justify-center rounded-full hover:bg-ink/10"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
