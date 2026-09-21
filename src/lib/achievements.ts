import { useSyncExternalStore } from "react";

export interface AchievementToast {
  id: number;
  name: string;
  hint: string;
}

const VISIBLE_MS = 7000;
const EMPTY: AchievementToast[] = [];

let toasts: AchievementToast[] = EMPTY;
let nextId = 1;
const listeners = new Set<() => void>();

function emit(next: AchievementToast[]): void {
  toasts = next;
  listeners.forEach((listener) => listener());
}

export function dismissToast(id: number): void {
  emit(toasts.filter((toast) => toast.id !== id));
}

/**
 * Shows a "milestone unlocked" notice for the badges a run just earned. Several at once are
 * grouped into one notice so they never pile up over the page.
 */
export function announceBadges(badges: { name: string; hint: string }[]): void {
  if (badges.length === 0) return;
  const toast: AchievementToast =
    badges.length === 1
      ? { id: nextId++, name: badges[0].name, hint: badges[0].hint }
      : {
          id: nextId++,
          name: `${badges.length} milestones`,
          hint: badges.map((badge) => badge.name).join(", "),
        };
  emit([...toasts, toast]);
  window.setTimeout(() => dismissToast(toast.id), VISIBLE_MS);
}

export function useToasts(): AchievementToast[] {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => toasts,
    () => EMPTY,
  );
}
