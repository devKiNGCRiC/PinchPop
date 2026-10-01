import type { SupabaseClient } from "@supabase/supabase-js";

import type { Memory } from "@/lib/memories";

/** Converts the saved JPEG data URL to a Blob and uploads it to the player's own photo folder. */
async function uploadPhoto(
  supabase: SupabaseClient,
  userId: string,
  runId: string,
  dataUrl: string,
): Promise<string> {
  const blob = await (await fetch(dataUrl)).blob();
  const path = `${userId}/${runId}.jpg`;
  const { error } = await supabase.storage
    .from("photos")
    .upload(path, blob, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;
  return path;
}

export interface SyncResult {
  ok: boolean;
  /** True if nothing was signed in, or this memory was already synced — not an error. */
  skipped: boolean;
  message?: string;
}

/**
 * Pushes one local memory to the signed-in player's cloud runs. A no-op while signed out.
 * Idempotent: syncing the same memory twice (the automatic sync on solve, then later the "import
 * my local runs" bulk import finding it again) skips instead of creating a duplicate, thanks to
 * the unique (user_id, local_id) index from the runs_followups migration.
 */
export async function syncMemoryToCloud(memory: Memory): Promise<SyncResult> {
  const { supabase } = await import("@/lib/supabase");
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return { ok: true, skipped: true };

  const userId = session.user.id;
  const runId = crypto.randomUUID();
  try {
    const photoPath = memory.photo
      ? await uploadPhoto(supabase, userId, runId, memory.photo)
      : null;

    const { error } = await supabase.from("runs").insert({
      id: runId,
      user_id: userId,
      art_id: memory.artId,
      moves: memory.moves,
      seconds: memory.seconds,
      score: memory.score,
      accuracy: memory.accuracy ?? null,
      photo_path: photoPath,
      aspect: memory.aspect ?? null,
      local_id: memory.id,
    });

    if (error) {
      if (error.code === "23505") return { ok: true, skipped: true }; // already synced
      return { ok: false, skipped: false, message: error.message };
    }
    return { ok: true, skipped: false };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      message: error instanceof Error ? error.message : "Could not sync this run.",
    };
  }
}

/** True once the signed-in player has at least one run in the cloud. */
export async function hasCloudRuns(userId: string): Promise<boolean> {
  const { supabase } = await import("@/lib/supabase");
  const { count, error } = await supabase
    .from("runs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);
  if (error) throw error;
  return (count ?? 0) > 0;
}

/** Syncs every local memory, oldest first, reporting progress as it goes. Safe to call even if
 * some (or all) were already synced — each is independently idempotent. */
export async function importLocalRuns(
  memories: Memory[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ synced: number; failed: number }> {
  const ordered = [...memories].sort((a, b) => a.createdAt - b.createdAt);
  let synced = 0;
  let failed = 0;
  for (let i = 0; i < ordered.length; i++) {
    const result = await syncMemoryToCloud(ordered[i]);
    if (result.ok) synced += result.skipped ? 0 : 1;
    else failed += 1;
    onProgress?.(i + 1, ordered.length);
  }
  return { synced, failed };
}

export interface CloudRun {
  id: string;
  userId: string;
  username: string;
  artId: string;
  moves: number;
  seconds: number;
  score: number;
  accuracy: number | null;
  createdAt: number;
}

interface RunRow {
  id: string;
  user_id: string;
  art_id: string;
  moves: number;
  seconds: number;
  score: number;
  accuracy: number | null;
  created_at: string;
  profiles: { username: string } | { username: string }[] | null;
}

/** The worldwide leaderboard: every signed-in player's runs, best score first. No photos — those
 * stay private to their owner; the destination's illustration stands in for everyone else's run. */
export async function fetchWorldwideLeaderboard(limit = 50): Promise<CloudRun[]> {
  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase
    .from("runs")
    .select("id, user_id, art_id, moves, seconds, score, accuracy, created_at, profiles(username)")
    .order("score", { ascending: false })
    .order("seconds", { ascending: true })
    .limit(limit);
  if (error) throw error;

  return ((data ?? []) as RunRow[]).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    return {
      id: row.id,
      userId: row.user_id,
      username: profile?.username ?? "Player",
      artId: row.art_id,
      moves: row.moves,
      seconds: row.seconds,
      score: row.score,
      accuracy: row.accuracy,
      createdAt: new Date(row.created_at).getTime(),
    };
  });
}
