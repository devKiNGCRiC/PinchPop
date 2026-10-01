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
