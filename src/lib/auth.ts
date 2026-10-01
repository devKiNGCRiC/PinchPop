import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";

export interface AuthState {
  session: Session | null;
  /** True only until the first session check resolves, so callers can avoid a sign-in flash. */
  loading: boolean;
}

/**
 * The current Supabase session, kept in sync as the player signs in or out anywhere in the app.
 * Loads the Supabase client lazily (dynamic import) so `@supabase/supabase-js` is its own chunk
 * rather than bundled into every page via the NavBar, which checks this on every route.
 */
export function useSession(): AuthState {
  const [state, setState] = useState<AuthState>({ session: null, loading: true });

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;
    import("@/lib/supabase").then(({ supabase }) => {
      if (!active) return;
      supabase.auth.getSession().then(({ data }) => {
        if (active) setState({ session: data.session, loading: false });
      });
      // Only synchronous state updates here — an async Supabase call made inside this callback
      // can deadlock the client (a known supabase-js issue).
      const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (active) setState({ session, loading: false });
      });
      unsubscribe = () => listener.subscription.unsubscribe();
    });
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  return state;
}

export interface ProfileState extends AuthState {
  /** The signed-in player's display name from public.profiles, or null while signed out/loading. */
  username: string | null;
  /** The signed-in player's avatar storage path, or null without one. Pass to avatarUrl() to
   * display it — see src/lib/avatar.ts. */
  avatarPath: string | null;
}

interface Fetched {
  userId: string;
  username: string | null;
  avatarPath: string | null;
}

/** The current session plus its profile, for anywhere that shows "who is this player". */
export function useProfile(): ProfileState {
  const { session, loading } = useSession();
  // Keyed to whichever user it was fetched for, so a stale value from a previous session can
  // never leak through — the ternary below masks it the instant `session` changes, with no need
  // to reset this state from inside the effect.
  const [fetched, setFetched] = useState<Fetched | null>(null);

  useEffect(() => {
    if (!session) return;
    let active = true;
    const userId = session.user.id;
    import("@/lib/supabase").then(({ supabase }) => {
      supabase
        .from("profiles")
        .select("username, avatar_path")
        .eq("id", userId)
        .maybeSingle()
        .then(({ data }) => {
          if (active) {
            setFetched({
              userId,
              username: data?.username ?? null,
              avatarPath: data?.avatar_path ?? null,
            });
          }
        });
    });
    return () => {
      active = false;
    };
  }, [session]);

  const matches = session && fetched?.userId === session.user.id;
  return {
    session,
    loading,
    username: matches ? fetched.username : null,
    avatarPath: matches ? fetched.avatarPath : null,
  };
}

export interface AuthResult {
  ok: boolean;
  message: string;
}

/** Turns a Supabase auth failure into a message a player can act on. */
function describeAuthError(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
  if (code === "invalid_credentials") return "Incorrect email or password.";
  if (code === "email_not_confirmed") {
    return "Confirm your email first — check the link we sent you.";
  }
  if (code === "user_already_exists" || code === "email_exists") {
    return "That email already has an account. Try signing in instead.";
  }
  if (code === "weak_password") return "Choose a longer, less guessable password.";
  if (code === "over_request_rate_limit" || code === "over_email_send_rate_limit") {
    return "Too many attempts — wait a minute and try again.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}

export async function signUp(
  email: string,
  password: string,
  username: string,
): Promise<AuthResult> {
  const { supabase } = await import("@/lib/supabase");
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });
  if (error) return { ok: false, message: describeAuthError(error) };
  if (!data.session) {
    return { ok: true, message: "Check your email to confirm your account, then sign in." };
  }
  return { ok: true, message: "Account created." };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { supabase } = await import("@/lib/supabase");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: describeAuthError(error) };
  return { ok: true, message: "Signed in." };
}

export async function signOut(): Promise<void> {
  const { supabase } = await import("@/lib/supabase");
  await supabase.auth.signOut();
}

/** Renames the signed-in player's profile. Enforces the same 3–24 char rule as the DB check. */
export async function updateUsername(userId: string, username: string): Promise<AuthResult> {
  if (username.length < 3 || username.length > 24) {
    return { ok: false, message: "Username must be 3–24 characters." };
  }
  const { supabase } = await import("@/lib/supabase");
  const { error } = await supabase.from("profiles").update({ username }).eq("id", userId);
  if (error) {
    if (error.code === "23505") return { ok: false, message: "That username is taken." };
    return { ok: false, message: error.message };
  }
  return { ok: true, message: "Username updated." };
}

/**
 * Permanently deletes the signed-in player's account: their photos, cloud runs, profile and
 * login. Supabase refuses to delete a user that still owns Storage objects, so their photo
 * folder is cleared first; the `runs` and `profiles` rows then cascade automatically from the
 * `delete_own_account` database function (see the delete_account migration). Local on-device
 * data in localStorage is untouched — this only removes what was synced to the cloud.
 */
export async function deleteAccount(userId: string): Promise<AuthResult> {
  const { supabase } = await import("@/lib/supabase");
  try {
    const { data: files, error: listError } = await supabase.storage.from("photos").list(userId);
    if (listError) return { ok: false, message: listError.message };
    if (files && files.length > 0) {
      const paths = files.map((file) => `${userId}/${file.name}`);
      const { error: removeError } = await supabase.storage.from("photos").remove(paths);
      if (removeError) return { ok: false, message: removeError.message };
    }

    const { error } = await supabase.rpc("delete_own_account");
    if (error) return { ok: false, message: error.message };

    await supabase.auth.signOut();
    return { ok: true, message: "Account deleted." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Could not delete the account.",
    };
  }
}
