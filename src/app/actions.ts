"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { MODE_COOKIE, type Mode } from "@/lib/mode";
import { safeNext } from "@/lib/safe-next";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { SnapResult } from "@/lib/ai/snap";
import type { RatingInput } from "@/lib/types";

export type ActionResult<T = null> = { ok: true; data: T } | { ok: false; error: string; needsLogin?: boolean };

// ─── Mode ───

export async function setMode(mode: Mode) {
  (await cookies()).set(MODE_COOKIE, mode, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/", "layout");
}

// ─── Auth ───

export type AuthState = { error?: string } | undefined;


export async function signIn(_: AuthState, form: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: "Live mode isn't set up yet." };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? ""),
  });
  if (error) return { error: error.message === "Invalid login credentials" ? "Wrong email or password." : error.message };
  revalidatePath("/", "layout");
  redirect(safeNext(form.get("next")));
}

export async function signUp(_: AuthState, form: FormData): Promise<AuthState> {
  if (!isSupabaseConfigured()) return { error: "Live mode isn't set up yet." };
  const name = String(form.get("name") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (name.length < 2) return { error: "Tell us your name." };
  if (password.length < 6) return { error: "Use at least 6 characters for the password." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: String(form.get("email") ?? "").trim(),
    password,
    options: {
      data: {
        name,
        handle: String(form.get("handle") ?? "").trim(),
        area: String(form.get("area") ?? ""),
        avatar: String(form.get("avatar") ?? ""),
      },
    },
  });
  if (error) return { error: error.message };
  if (!data.session) {
    return { error: "Check your email to confirm your account, then sign in. (Tip: turn off “Confirm email” in Supabase for instant play.)" };
  }
  revalidatePath("/", "layout");
  redirect(safeNext(form.get("next")));
}

export type ResetState = { error?: string; sent?: boolean } | undefined;

export async function requestPasswordReset(_: ResetState, form: FormData): Promise<ResetState> {
  if (!isSupabaseConfigured()) return { error: "Live mode isn't set up yet." };
  const email = String(form.get("email") ?? "").trim();
  if (!email.includes("@")) return { error: "Enter the email you signed up with." };

  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });
  // Rate limits are worth surfacing; anything else gets the same answer so emails can't be probed.
  if (error?.status === 429) return { error: "Too many reset emails right now. Try again in a little while." };
  return { sent: true };
}

export async function updatePassword(_: AuthState, form: FormData): Promise<AuthState> {
  const password = String(form.get("password") ?? "");
  if (password.length < 6) return { error: "Use at least 6 characters." };
  if (password !== String(form.get("confirm") ?? "")) return { error: "The two passwords don't match." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  redirect("/profile");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// ─── Player actions (each wraps a security-definer function in the database) ───

async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<ActionResult<T>> {
  if (!isSupabaseConfigured()) return { ok: false, error: "Live mode isn't set up yet." };
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) return { ok: false, error: "Sign in to play.", needsLogin: true };

  const { data, error } = await supabase.rpc(fn, args);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true, data: data as T };
}

export async function backCampaign(campaignId: string, amount: number) {
  return rpc<{ raised: number; backers: number; funded: boolean }>("back_campaign", {
    p_campaign: campaignId,
    p_amount: amount,
  });
}

export async function rateStall(stallId: string, r: RatingInput) {
  return rpc<null>("rate_stall", {
    p_stall: stallId,
    p_taste: r.taste,
    p_hygiene: r.hygiene,
    p_value: r.value,
    p_vibe: r.vibe,
    p_review: r.review,
  });
}

export async function vouchStall(stallId: string) {
  return rpc<{ vouches: number; status: "live" | "pending" }>("vouch_stall", { p_stall: stallId });
}

export async function suggestStall(input: {
  name: string;
  area: string;
  tags: string[];
  veg: boolean;
  dishes: SnapResult["dishes"];
  osmId?: string;
  lat?: number;
  lng?: number;
}) {
  return rpc<string>("suggest_stall", {
    p_name: input.name,
    p_area: input.area,
    p_tags: input.tags,
    p_veg: input.veg,
    p_dishes: input.dishes,
    p_osm_id: input.osmId ?? null,
    p_lat: input.lat ?? null,
    p_lng: input.lng ?? null,
  });
}

export async function withdrawEarnings(amount: number, upi: string) {
  return rpc<null>("withdraw_earnings", { p_amount: amount, p_upi: upi });
}

export async function redeemCredit(stallId: string, amount: number) {
  return rpc<string>("redeem_credit", { p_stall: stallId, p_amount: amount });
}

export async function simulateMonth() {
  return rpc<number>("simulate_month", {});
}

// ─── Vendor actions ───

export type VendorProfileInput = { vendorName: string; quote: string; avatar: string };

export async function claimStall(stallId: string, v: VendorProfileInput) {
  return rpc<null>("claim_stall", { p_stall: stallId, p_vendor_name: v.vendorName, p_quote: v.quote, p_avatar: v.avatar });
}

export async function registerStall(
  input: VendorProfileInput & {
    name: string;
    area: string;
    tags: string[];
    veg: boolean;
    timings: string;
    avgPrice: number;
    dishes: { name: string; original: string | null; price: number | null }[];
    lat?: number;
    lng?: number;
  },
) {
  return rpc<string>("register_stall", {
    p_name: input.name,
    p_area: input.area,
    p_vendor_name: input.vendorName,
    p_quote: input.quote,
    p_avatar: input.avatar,
    p_tags: input.tags,
    p_veg: input.veg,
    p_timings: input.timings,
    p_avg_price: input.avgPrice,
    p_dishes: input.dishes,
    p_lat: input.lat ?? null,
    p_lng: input.lng ?? null,
  });
}

export async function createCampaign(input: {
  shortGoal: string;
  story: string;
  goal: number;
  days: number;
  costBreakdown: { item: string; amount: number }[];
  pctOfGrowth: number;
  cap: number;
  baselineMonthly: number;
}) {
  return rpc<string>("create_campaign", {
    p_title: "",
    p_short_goal: input.shortGoal,
    p_story: input.story,
    p_goal: input.goal,
    p_days: input.days,
    p_cost_breakdown: input.costBreakdown,
    p_pct: input.pctOfGrowth,
    p_cap: input.cap,
    p_baseline: input.baselineMonthly,
  });
}

export async function postUpdate(text: string, emoji: string) {
  return rpc<null>("post_update", { p_text: text, p_emoji: emoji });
}

export async function acceptRedeemCode(code: string) {
  return rpc<{ amount: number; name: string; handle: string; avatar: string }>("accept_redeem_code", { p_code: code });
}
