// Live mode is available only when the Supabase project is configured.
// Accepts the newer "publishable" key name as well as the classic anon key.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}
