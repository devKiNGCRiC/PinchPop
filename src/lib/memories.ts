import { useSyncExternalStore } from "react";

import { announceBadges } from "@/lib/achievements";
import { scoreFor } from "@/lib/puzzle";
import { BADGES } from "@/lib/stats";

/** One solved puzzle, kept as a polaroid on this device until accounts and storage exist. */
export interface Memory {
  id: string;
  artId: string;
  moves: number;
  seconds: number;
  score: number;
  createdAt: number;
  /** Share of moves that put a piece in its right place, from 0 to 1. Missing on older runs. */
  accuracy?: number;
  /** A small JPEG data URL for photos taken in camera mode (artId "camera"). */
  photo?: string;
  /** Width divided by height of `photo`. */
  aspect?: number;
}

const STORAGE_KEY = "pinchpop.memories.v1";
const EMPTY: Memory[] = [];

let cachedRaw: string | null = null;
let cachedList: Memory[] = EMPTY;
const listeners = new Set<() => void>();

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function isMemory(value: unknown): value is Memory {
  if (typeof value !== "object" || value === null) return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
    typeof m.artId === "string" &&
    typeof m.moves === "number" &&
    typeof m.seconds === "number" &&
    typeof m.score === "number" &&
    typeof m.createdAt === "number" &&
    (m.accuracy === undefined || typeof m.accuracy === "number") &&
    (m.photo === undefined || typeof m.photo === "string") &&
    (m.aspect === undefined || typeof m.aspect === "number")
  );
}

// useSyncExternalStore needs a referentially stable snapshot, so the parsed list is cached
// against the raw string and only rebuilt when the stored value actually changes.
function getSnapshot(): Memory[] {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedList;
  cachedRaw = raw;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cachedList = Array.isArray(parsed) ? parsed.filter(isMemory) : EMPTY;
  } catch {
    console.warn("[PinchPop] Could not read saved memories; starting fresh.");
    cachedList = EMPTY;
  }
  return cachedList;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function write(next: Memory[]): void {
  let list = next;
  // Photos are the bulky part. If the browser's storage is full, drop the oldest photo (keeping
  // its score and stamp) and try again, instead of losing the newest run.
  for (;;) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      break;
    } catch {
      const oldest = list.findLastIndex((m) => m.photo !== undefined);
      if (oldest === -1) {
        console.warn("[PinchPop] Could not save to this browser's storage.");
        break;
      }
      console.warn("[PinchPop] Storage is full; removed the oldest saved photo to make room.");
      list = list.map((m, i) => (i === oldest ? { ...m, photo: undefined, aspect: undefined } : m));
    }
  }
  listeners.forEach((listener) => listener());
}

export function saveMemory(input: {
  artId: string;
  moves: number;
  seconds: number;
  accuracy?: number;
  photo?: string;
  aspect?: number;
}): Memory {
  const memory: Memory = {
    id: crypto.randomUUID().slice(0, 8),
    artId: input.artId,
    moves: input.moves,
    seconds: input.seconds,
    score: scoreFor(input.moves, input.seconds, input.accuracy),
    createdAt: Date.now(),
    ...(input.accuracy !== undefined ? { accuracy: input.accuracy } : {}),
    ...(input.photo ? { photo: input.photo, aspect: input.aspect } : {}),
  };
  const previous = getSnapshot();
  const updated = [memory, ...previous];
  write(updated);
  // Tell the player about any milestone this run just unlocked.
  const alreadyEarned = new Set(BADGES.filter((b) => b.earned(previous)).map((b) => b.id));
  announceBadges(BADGES.filter((b) => !alreadyEarned.has(b.id) && b.earned(updated)));
  return memory;
}

export function deleteMemory(id: string): void {
  write(getSnapshot().filter((memory) => memory.id !== id));
}

export function clearMemories(): void {
  write([]);
}

/** Newest first. */
export function useMemories(): Memory[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
