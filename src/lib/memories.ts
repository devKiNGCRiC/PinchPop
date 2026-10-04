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
  /** A player-written caption for a camera photo, written by the player. */
  caption?: string;
  /** Whoever was signed in when this was saved, or undefined for anonymous play. Every read in
   * this module is scoped to this so one browser shared by several accounts never mixes their
   * local galleries — see setActiveUser(). */
  ownerId?: string;
}

const STORAGE_KEY = "pinchpop.memories.v1";
const EMPTY: Memory[] = [];

/** Who "my local memories" currently means. Kept in sync with the real Supabase session by a
 * bridge in AppShell (useMemoriesAuthBridge) — this module has no Supabase dependency itself, so
 * it stays synchronous and easy to unit test. null means signed out (anonymous/guest). */
let currentUserId: string | null = null;
const listeners = new Set<() => void>();

/** Called once, wherever the app tracks the real auth session (see useMemoriesAuthBridge). Not
 * meant to be called from UI code directly. */
export function setActiveUser(userId: string | null): void {
  if (userId === currentUserId) return;
  currentUserId = userId;
  listeners.forEach((listener) => listener());
}

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
    (m.aspect === undefined || typeof m.aspect === "number") &&
    (m.caption === undefined || typeof m.caption === "string") &&
    (m.ownerId === undefined || typeof m.ownerId === "string")
  );
}

/** Every memory on this device, regardless of owner. Only for the write paths below, which must
 * never drop another identity's entries just because the current scope only sees its own. */
function getAllRaw(): Memory[] {
  try {
    const raw = readRaw();
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isMemory) : EMPTY;
  } catch {
    console.warn("[PinchPop] Could not read saved memories; starting fresh.");
    return EMPTY;
  }
}

// useSyncExternalStore needs a referentially stable snapshot, so each scoped view below caches
// its filtered list against the raw string (and, for the "current identity" view, the active
// user) and only rebuilds when either actually changes.
let cachedRaw: string | null = null;
let cachedForUser: string | null = null;
let cachedHasRun = false;
let cachedList: Memory[] = EMPTY;

/** Newest first, for whoever is currently signed in (or anonymous play, if no one is). A plain
 * function (no React dependency) so it's directly unit-testable; useMemories() below just wraps
 * it for the subscribe/re-render behaviour. */
export function getSnapshot(): Memory[] {
  const raw = readRaw();
  if (cachedHasRun && raw === cachedRaw && cachedForUser === currentUserId) return cachedList;
  cachedHasRun = true;
  cachedRaw = raw;
  cachedForUser = currentUserId;
  cachedList = getAllRaw().filter((m) => (m.ownerId ?? null) === currentUserId);
  return cachedList;
}

let cachedGuestRaw: string | null = null;
let cachedGuestHasRun = false;
let cachedGuestList: Memory[] = EMPTY;

/** Newest first, for anonymous play only — independent of who is currently signed in. This is
 * what "import my local runs" offers to attach to an account (see claimMemory()). Also a plain,
 * directly-testable function — see getSnapshot()'s comment. */
export function getGuestSnapshot(): Memory[] {
  const raw = readRaw();
  if (cachedGuestHasRun && raw === cachedGuestRaw) return cachedGuestList;
  cachedGuestHasRun = true;
  cachedGuestRaw = raw;
  cachedGuestList = getAllRaw().filter((m) => m.ownerId === undefined);
  return cachedGuestList;
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
    ...(currentUserId ? { ownerId: currentUserId } : {}),
    ...(input.accuracy !== undefined ? { accuracy: input.accuracy } : {}),
    ...(input.photo ? { photo: input.photo, aspect: input.aspect } : {}),
  };
  const previousAll = getAllRaw();
  write([memory, ...previousAll]);

  // Milestones only ever compare against the current identity's own history, never another
  // account's or the guest's entries that might also be sitting on this device.
  const previousOwn = previousAll.filter((m) => (m.ownerId ?? null) === currentUserId);
  const alreadyEarned = new Set(BADGES.filter((b) => b.earned(previousOwn)).map((b) => b.id));
  announceBadges(
    BADGES.filter((b) => !alreadyEarned.has(b.id) && b.earned([memory, ...previousOwn])),
  );

  // Best-effort, non-blocking: a signed-in player's run also goes to the cloud leaderboard. A
  // dynamic import keeps @supabase/supabase-js out of every page that can ever save a memory
  // (nearly all of them) — it only loads once a save actually happens.
  void import("@/lib/cloudRuns")
    .then(({ syncMemoryToCloud }) => syncMemoryToCloud(memory))
    .then((result) => {
      if (!result.ok) console.warn("[PinchPop] Cloud sync failed:", result.message);
    })
    .catch((error: unknown) => console.warn("[PinchPop] Cloud sync failed:", error));
  return memory;
}

export function deleteMemory(id: string): void {
  write(getAllRaw().filter((memory) => memory.id !== id));
}

/** Renames a memory's caption. An empty/whitespace-only value reverts to the destination's
 * default caption (none for camera photos) rather than storing a blank string. */
export function updateMemoryCaption(id: string, caption: string): void {
  const trimmed = caption.trim();
  write(
    getAllRaw().map((memory) =>
      memory.id === id ? { ...memory, caption: trimmed || undefined } : memory,
    ),
  );
}

/** Attaches a previously-anonymous local memory to an account, once it has been imported to the
 * cloud under that account — so it stops being offered for import again, and starts showing up
 * in that account's own local gallery from then on. */
export function claimMemory(id: string, userId: string): void {
  write(getAllRaw().map((memory) => (memory.id === id ? { ...memory, ownerId: userId } : memory)));
}

/** Clears only the current identity's own local memories — signed-in players never wipe another
 * account's (or the guest's) data sitting on the same device by clicking this. */
export function clearMemories(): void {
  write(getAllRaw().filter((memory) => (memory.ownerId ?? null) !== currentUserId));
}

/** Newest first, for whoever is currently signed in (or anonymous play, if no one is). */
export function useMemories(): Memory[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

/** Newest first, anonymous plays only — see getGuestSnapshot(). */
export function useGuestMemories(): Memory[] {
  return useSyncExternalStore(subscribe, getGuestSnapshot, () => EMPTY);
}
