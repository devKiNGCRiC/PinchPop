import { useSyncExternalStore } from "react";

import { scoreFor } from "@/lib/puzzle";

/** One solved puzzle, kept as a polaroid on this device until accounts and storage exist. */
export interface Memory {
  id: string;
  artId: string;
  moves: number;
  seconds: number;
  score: number;
  createdAt: number;
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
    typeof m.createdAt === "number"
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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    console.warn("[PinchPop] Could not save to this browser's storage.");
  }
  listeners.forEach((listener) => listener());
}

export function saveMemory(input: { artId: string; moves: number; seconds: number }): Memory {
  const memory: Memory = {
    id: crypto.randomUUID().slice(0, 8),
    artId: input.artId,
    moves: input.moves,
    seconds: input.seconds,
    score: scoreFor(input.moves, input.seconds),
    createdAt: Date.now(),
  };
  write([memory, ...getSnapshot()]);
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
