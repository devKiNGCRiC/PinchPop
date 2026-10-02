import { beforeEach, describe, expect, it } from "vitest";

// memories.ts only touches localStorage/window inside function bodies, never at module load, so
// polyfilling these two browser globals here (plain Node has neither) is enough to test it in the
// project's existing Node test environment — no jsdom or other new dependency needed.
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) ?? null) : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}
const memoryStorage = new MemoryStorage();
Object.assign(globalThis, {
  localStorage: memoryStorage,
  // setTimeout is needed too: saving a memory that earns a new badge schedules a toast dismissal.
  window: { addEventListener() {}, removeEventListener() {}, setTimeout, clearTimeout },
});

import {
  claimMemory,
  clearMemories,
  deleteMemory,
  getGuestSnapshot,
  getSnapshot,
  saveMemory,
  setActiveUser,
} from "@/lib/memories";

const STORAGE_KEY = "pinchpop.memories.v1";

/** The full, unscoped storage contents — bypasses the current-identity filter entirely, so tests
 * can assert that a write made under one scope never silently drops another scope's data. */
function allStored(): unknown[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as unknown[]) : [];
}

beforeEach(() => {
  localStorage.clear();
  setActiveUser(null);
});

describe("per-identity scoping", () => {
  it("stamps no ownerId while signed out, and the real user id while signed in", () => {
    const guestRun = saveMemory({ artId: "taj", moves: 5, seconds: 10 });
    expect((guestRun as { ownerId?: string }).ownerId).toBeUndefined();

    setActiveUser("alice");
    const aliceRun = saveMemory({ artId: "taj", moves: 5, seconds: 10 });
    expect((aliceRun as { ownerId?: string }).ownerId).toBe("alice");
  });

  it("never shows one account's local runs to another signed-in on the same device", () => {
    setActiveUser("alice");
    saveMemory({ artId: "taj", moves: 5, seconds: 10 });

    setActiveUser("bob");
    expect(getSnapshot()).toHaveLength(0); // bob sees none of alice's runs

    saveMemory({ artId: "jaipur", moves: 3, seconds: 8 });
    expect(getSnapshot()).toHaveLength(1);
    expect(getSnapshot()[0].artId).toBe("jaipur");

    setActiveUser("alice");
    expect(getSnapshot()).toHaveLength(1);
    expect(getSnapshot()[0].artId).toBe("taj");
  });

  it("hides a signed-in account's runs from anonymous play, and vice versa", () => {
    saveMemory({ artId: "taj", moves: 1, seconds: 1 }); // anonymous
    setActiveUser("alice");
    saveMemory({ artId: "jaipur", moves: 2, seconds: 2 }); // alice's

    expect(getSnapshot()).toHaveLength(1);
    expect(getGuestSnapshot()).toHaveLength(1);
    expect(getGuestSnapshot()[0].artId).toBe("taj");

    setActiveUser(null);
    expect(getSnapshot()).toHaveLength(1);
    expect(getSnapshot()[0].artId).toBe("taj");
  });

  it("never loses another identity's data when saving, deleting or clearing", () => {
    setActiveUser("alice");
    const aliceRun = saveMemory({ artId: "taj", moves: 1, seconds: 1 });
    setActiveUser("bob");
    saveMemory({ artId: "jaipur", moves: 2, seconds: 2 });

    // Saving as bob must not erase alice's entry from the underlying storage.
    expect(allStored()).toHaveLength(2);

    // Deleting bob's own run must not touch alice's.
    deleteMemory(getSnapshot()[0].id);
    expect(allStored()).toHaveLength(1);
    expect(allStored()[0]).toMatchObject({ id: aliceRun.id });

    // bob clearing "all my data" only clears bob's (already-empty) scope, never alice's.
    clearMemories();
    expect(allStored()).toHaveLength(1);

    setActiveUser("alice");
    clearMemories();
    expect(allStored()).toHaveLength(0);
  });

  it("claims a guest run for an account: it leaves the guest view and joins that account's", () => {
    const guestRun = saveMemory({ artId: "taj", moves: 1, seconds: 1 });
    expect(getGuestSnapshot()).toHaveLength(1);

    claimMemory(guestRun.id, "alice");
    expect(getGuestSnapshot()).toHaveLength(0);

    setActiveUser("alice");
    expect(getSnapshot()).toHaveLength(1);
    expect(getSnapshot()[0].id).toBe(guestRun.id);
  });
});
