import { cookies } from "next/headers";
import { isSupabaseConfigured } from "./supabase/config";

export type Mode = "demo" | "live";
export const MODE_COOKIE = "hissa-mode";

// Demo: rich mock data, nothing saved. Live: real players on Supabase.
// Live is the default once Supabase is configured; anyone can flip to the demo.
export async function getMode(): Promise<Mode> {
  if (!isSupabaseConfigured()) return "demo";
  const value = (await cookies()).get(MODE_COOKIE)?.value;
  return value === "demo" ? "demo" : "live";
}
