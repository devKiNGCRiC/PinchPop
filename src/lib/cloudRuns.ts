import type { SupabaseClient } from "@supabase/supabase-js";

import { claimMemory } from "@/lib/memories";
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
 * some (or all) were already synced — each is independently idempotent. Successfully-synced
 * memories are also claimed locally for `userId` (see claimMemory()), so they stop being
 * anonymous and show up in this account's own local gallery from now on, instead of being
 * re-offered for import every time. */
export async function importLocalRuns(
  userId: string,
  memories: Memory[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ synced: number; failed: number }> {
  const ordered = [...memories].sort((a, b) => a.createdAt - b.createdAt);
  let synced = 0;
  let failed = 0;
  for (let i = 0; i < ordered.length; i++) {
    const result = await syncMemoryToCloud(ordered[i]);
    if (result.ok) {
      synced += result.skipped ? 0 : 1;
      claimMemory(ordered[i].id, userId);
    } else {
      failed += 1;
    }
    onProgress?.(i + 1, ordered.length);
  }
  return { synced, failed };
}

/** A signed, time-limited URL for a private photo in the "photos" bucket. Resolves only for the
 * path's own owner — the bucket's RLS is folder-scoped by auth.uid(), so this comes back null for
 * anyone else's photo regardless of how public the owning `runs` row itself is. `size` requests a
 * resized thumbnail (cheaper to load in a grid) rather than the full photo. */
export async function signedPhotoUrl(
  path: string,
  size?: { width: number; height: number },
): Promise<string | null> {
  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase.storage
    .from("photos")
    .createSignedUrl(path, 3600, size ? { transform: size } : undefined);
  if (error || !data) return null;
  return data.signedUrl;
}

export interface MyCloudRun {
  /** The cloud row's own id — distinct from, and never confused with, a local 8-char memory id. */
  id: string;
  /** The local memory this was synced from, if it was synced from *this* device. */
  localId: string | null;
  artId: string;
  moves: number;
  seconds: number;
  score: number;
  accuracy: number | null;
  createdAt: number;
  photoPath: string | null;
  aspect: number | null;
}

interface MyRunRow {
  id: string;
  local_id: string | null;
  art_id: string;
  moves: number;
  seconds: number;
  score: number;
  accuracy: number | null;
  created_at: string;
  photo_path: string | null;
  aspect: number | null;
}

/** All of the signed-in player's own cloud runs — the private shape (includes local_id and
 * photo_path), unlike the public leaderboard's. Used to fill the Album with runs that exist in
 * the cloud but not on this device (solved elsewhere), and to resolve a single run for the
 * Results page when it isn't found locally — see fetchCloudRunAsMemory(). */
export async function fetchMyCloudRuns(userId: string): Promise<MyCloudRun[]> {
  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase
    .from("runs")
    .select("id, local_id, art_id, moves, seconds, score, accuracy, created_at, photo_path, aspect")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return ((data ?? []) as MyRunRow[]).map((row) => ({
    id: row.id,
    localId: row.local_id,
    artId: row.art_id,
    moves: row.moves,
    seconds: row.seconds,
    score: row.score,
    accuracy: row.accuracy,
    createdAt: new Date(row.created_at).getTime(),
    photoPath: row.photo_path,
    aspect: row.aspect,
  }));
}

/** One specific cloud run by its own id, as a Memory-shaped object the existing Results/Polaroid
 * UI can render unchanged — used when a requested memory isn't on this device (e.g. it was
 * solved on a different one). The photo resolves to a signed URL only for its owner; anyone else
 * (or anonymous) gets null, same privacy boundary as everywhere else a photo could be shown. */
export async function fetchCloudRunAsMemory(runId: string): Promise<Memory | null> {
  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase
    .from("runs")
    .select("id, art_id, moves, seconds, score, accuracy, created_at, photo_path, aspect")
    .eq("id", runId)
    .maybeSingle();
  if (error || !data) return null;

  const row = data as MyRunRow;
  const photo = row.photo_path ? await signedPhotoUrl(row.photo_path) : null;
  return {
    id: row.id,
    artId: row.art_id,
    moves: row.moves,
    seconds: row.seconds,
    score: row.score,
    createdAt: new Date(row.created_at).getTime(),
    ...(row.accuracy !== null ? { accuracy: row.accuracy } : {}),
    ...(photo ? { photo, aspect: row.aspect ?? undefined } : {}),
  };
}

/** Whether a local memory's synced cloud run has been made public. False (not an error) if the
 * run hasn't finished syncing yet. */
export async function getRunPublicStatus(userId: string, localId: string): Promise<boolean> {
  const { supabase } = await import("@/lib/supabase");
  const { data } = await supabase
    .from("runs")
    .select("is_public")
    .eq("user_id", userId)
    .eq("local_id", localId)
    .maybeSingle();
  return data?.is_public ?? false;
}

/** Toggles a local memory's synced cloud run between public and private. Fails with a friendly
 * message if the run hasn't finished syncing to the cloud yet (nothing to toggle). */
export async function setRunPublic(
  userId: string,
  localId: string,
  isPublic: boolean,
): Promise<{ ok: boolean; message?: string }> {
  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase
    .from("runs")
    .update({ is_public: isPublic })
    .eq("user_id", userId)
    .eq("local_id", localId)
    .select("id");
  if (error) return { ok: false, message: error.message };
  if (!data || data.length === 0) {
    return {
      ok: false,
      message: "This photo hasn't finished syncing to your account yet — try again shortly.",
    };
  }
  return { ok: true };
}

/** The public share page's lookup: a player's public run by their username and the run's local
 * id, as a Memory-shaped object. Resolves to null for a private run or an unknown username/id,
 * even though the run's stats are already visible on the worldwide leaderboard regardless — a
 * share link is a stronger, deliberate signal than appearing anonymously on a leaderboard, so it
 * only ever resolves for a run the player explicitly made public. */
export async function fetchPublicRun(username: string, localId: string): Promise<Memory | null> {
  const { supabase } = await import("@/lib/supabase");
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (!profile) return null;

  const { data, error } = await supabase
    .from("runs")
    .select("art_id, moves, seconds, score, accuracy, created_at, photo_path, aspect")
    .eq("user_id", profile.id)
    .eq("local_id", localId)
    .eq("is_public", true)
    .maybeSingle();
  if (error || !data) return null;

  const row = data as Omit<MyRunRow, "id" | "local_id">;
  const photo = row.photo_path ? await signedPhotoUrl(row.photo_path) : null;
  return {
    id: localId,
    artId: row.art_id,
    moves: row.moves,
    seconds: row.seconds,
    score: row.score,
    createdAt: new Date(row.created_at).getTime(),
    ...(row.accuracy !== null ? { accuracy: row.accuracy } : {}),
    ...(photo ? { photo, aspect: row.aspect ?? undefined } : {}),
  };
}

export interface CloudRun {
  id: string;
  userId: string;
  username: string;
  /** Storage path for the player's avatar, if they have one — pass to avatarUrl() to display it. */
  avatarPath: string | null;
  artId: string;
  moves: number;
  seconds: number;
  score: number;
  accuracy: number | null;
  createdAt: number;
}

interface ProfileRef {
  username: string;
  avatar_path: string | null;
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
  profiles: ProfileRef | ProfileRef[] | null;
}

/** The worldwide leaderboard: every signed-in player's runs, best score first. No photos — those
 * stay private to their owner; an avatar (if set) or the destination's illustration stands in for
 * everyone else's run. */
export async function fetchWorldwideLeaderboard(limit = 50): Promise<CloudRun[]> {
  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase
    .from("runs")
    .select(
      "id, user_id, art_id, moves, seconds, score, accuracy, created_at, profiles(username, avatar_path)",
    )
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
      avatarPath: profile?.avatar_path ?? null,
      artId: row.art_id,
      moves: row.moves,
      seconds: row.seconds,
      score: row.score,
      accuracy: row.accuracy,
      createdAt: new Date(row.created_at).getTime(),
    };
  });
}
