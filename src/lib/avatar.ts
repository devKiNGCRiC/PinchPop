const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

// An explicit allowlist, not just a `startsWith("image/")` prefix check — that prefix also
// admits "image/svg+xml", and an uploaded SVG is stored (and served, since "avatars" is a public
// bucket) with whatever Content-Type the uploader claims. A script embedded in that SVG would run
// if anyone opened the file's URL directly rather than through an <img> tag. Restricting to
// genuine raster formats makes that impossible regardless of what a file claims to be.
const AVATAR_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export interface AvatarResult {
  ok: boolean;
  message: string;
}

/** The public URL for a stored avatar path, or null without one. Pure string interpolation (the
 * "avatars" bucket is public — see the avatars migration), so displaying an avatar never needs to
 * load the Supabase client, unlike uploading one. */
export function avatarUrl(path: string | null | undefined): string | null {
  if (!path || !SUPABASE_URL) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
}

/** Uploads a user-picked image as their avatar, replacing any existing one, and saves its storage
 * path on their profile. */
export async function uploadAvatar(userId: string, file: File): Promise<AvatarResult> {
  const extension = AVATAR_TYPES[file.type];
  if (!extension) {
    return { ok: false, message: "Choose a JPEG, PNG or WEBP photo." };
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return { ok: false, message: "That photo is too large (max 5 MB). Try a smaller one." };
  }

  const { supabase } = await import("@/lib/supabase");
  const path = `${userId}/avatar.${extension}`;

  // file.type is safe to use as the stored Content-Type here: it matched a key in AVATAR_TYPES
  // above, so it can only be one of the three allowlisted raster types, never anything
  // script-capable.
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { contentType: file.type, upsert: true });
  if (uploadError) return { ok: false, message: uploadError.message };

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_path: path })
    .eq("id", userId);
  if (updateError) return { ok: false, message: updateError.message };

  return { ok: true, message: "Avatar updated." };
}

/** Removes the player's avatar, both the stored file and the profile's reference to it. */
export async function removeAvatar(userId: string, path: string): Promise<AvatarResult> {
  const { supabase } = await import("@/lib/supabase");
  await supabase.storage.from("avatars").remove([path]);
  const { error } = await supabase.from("profiles").update({ avatar_path: null }).eq("id", userId);
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: "Avatar removed." };
}
