/** Whether this build has Supabase settings. Kept apart from supabase.ts so code can check it
 * without loading (or failing to load) the Supabase client itself. */
export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

export const NOT_CONFIGURED_MESSAGE =
  "Sign-in isn't set up on this copy of PinchPop. You can still play; your runs save on this device.";
