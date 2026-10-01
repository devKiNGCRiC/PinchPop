import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !publishableKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Add them to .env.local (see .env.example).",
  );
}

// Safe to expose: this is the publishable key, not the secret key. Access control is enforced by
// Row Level Security policies on each table, not by keeping this key secret.
export const supabase = createClient(url, publishableKey);
