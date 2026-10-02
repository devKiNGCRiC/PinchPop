export interface PublicPlayer {
  username: string;
  bio: string | null;
  avatarPath: string | null;
  bestScore: number | null;
  totalSolves: number;
  /** How many of the four illustrated destinations they have solved (camera shots don't count). */
  destinationsVisited: number;
}

/** A player's public profile by username: avatar, bio and a few aggregate stats — never their
 * actual photos, which stay private to their owner even here. Null if no such username exists. */
export async function fetchPublicPlayer(username: string): Promise<PublicPlayer | null> {
  const { supabase } = await import("@/lib/supabase");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, bio, avatar_path")
    .eq("username", username)
    .maybeSingle();
  if (profileError) throw profileError;
  if (!profile) return null;

  const { data: runs, error: runsError } = await supabase
    .from("runs")
    .select("score, art_id")
    .eq("user_id", profile.id);
  if (runsError) throw runsError;

  const rows = (runs ?? []) as { score: number; art_id: string }[];
  const destinations = new Set(rows.filter((r) => r.art_id !== "camera").map((r) => r.art_id));

  return {
    username: profile.username as string,
    bio: (profile.bio as string | null) ?? null,
    avatarPath: (profile.avatar_path as string | null) ?? null,
    bestScore: rows.length > 0 ? Math.max(...rows.map((r) => r.score)) : null,
    totalSolves: rows.length,
    destinationsVisited: destinations.size,
  };
}
