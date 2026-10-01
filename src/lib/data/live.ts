// Live data source: real players on Supabase. Returns the same shapes as the demo source.
import { cache } from "react";
import { matchCuisine } from "../osm";
import { createClient } from "../supabase/server";
import type { Campaign, Critic, RatingBreakdown, Review, Stall, Viewer, WalletTxn } from "../types";
import type { DataSource } from "./index";

type ProfileRow = { id: string; handle: string; name: string; avatar: string; area: string; persona: string };
type RatingRow = RatingBreakdown & {
  stall_id: string;
  profile_id: string;
  review: string;
  is_seed: boolean;
  created_at: string;
  author: Pick<ProfileRow, "handle" | "name" | "avatar" | "persona"> | null;
};
type StallRow = {
  id: string;
  status: "live" | "pending";
  name: string;
  vendor_name: string;
  vendor_avatar: string;
  vendor_quote: string;
  area: string;
  lat: number | null;
  lng: number | null;
  emoji: string;
  hue: number;
  dish: string | null;
  tags: string[];
  veg: boolean;
  avg_price: number;
  timings: string;
  base_ratings: RatingBreakdown;
  base_count: number;
  verified: boolean;
  since: number | null;
  dishes: Stall["dishes"];
  ai_summary: string;
  campaign_id: string | null;
  owner_id: string | null;
  suggester: { handle: string } | null;
};
type CampaignRow = {
  id: string;
  stall_id: string;
  title: string;
  short_goal: string;
  story: string;
  goal: number;
  raised: number;
  backers: number;
  ends_on: string;
  cost_breakdown: Campaign["costBreakdown"];
  revenue_share: Campaign["revenueShare"];
  milestones: Campaign["milestones"];
  insight: Campaign["insight"];
  updates: Campaign["updates"];
};

const DIMENSIONS = ["taste", "hygiene", "value", "vibe"] as const;
const DAY_MS = 24 * 60 * 60 * 1000;

function fail(what: string, error: { message: string } | null): never {
  throw new Error(`Couldn't load ${what} from Supabase: ${error?.message ?? "unknown error"}`);
}

/** The signed-in player's profile, or null. Cached per request. */
export const getMyProfile = cache(async (): Promise<ProfileRow | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const uid = data?.claims?.sub;
  if (!uid) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, handle, name, avatar, area, persona")
    .eq("user_id", uid)
    .maybeSingle();
  return profile;
});

const loadStalls = cache(async (): Promise<Stall[]> => {
  const supabase = await createClient();
  const [stallsRes, ratingsRes, vouchesRes, me] = await Promise.all([
    // Named FK: stalls and profiles are also linked through vouches, so the embed must say which relationship.
    supabase.from("stalls").select("*, suggester:profiles!stalls_suggested_by_fkey(handle)"),
    supabase
      .from("ratings")
      .select("stall_id, profile_id, taste, hygiene, value, vibe, review, is_seed, created_at, author:profiles!ratings_profile_id_fkey(handle, name, avatar, persona)")
      .order("created_at", { ascending: false }),
    supabase.from("vouches").select("stall_id, profile_id"),
    getMyProfile(),
  ]);
  if (stallsRes.error) fail("stalls", stallsRes.error);
  if (ratingsRes.error) fail("ratings", ratingsRes.error);
  if (vouchesRes.error) fail("vouches", vouchesRes.error);

  const ratings = ratingsRes.data as unknown as RatingRow[];
  const vouches = vouchesRes.data as { stall_id: string; profile_id: string }[];

  return (stallsRes.data as StallRow[]).map((row) => {
    const own = ratings.filter((r) => r.stall_id === row.id);
    // Seeded reviews are already counted in base_ratings; player ratings are added on top.
    const fresh = own.filter((r) => !r.is_seed);
    const total = row.base_count + fresh.length;
    const combined = Object.fromEntries(
      DIMENSIONS.map((d) => {
        const sum = row.base_ratings[d] * row.base_count + fresh.reduce((s, r) => s + r[d], 0);
        return [d, total ? Math.round((sum / total) * 10) / 10 : 0];
      }),
    ) as RatingBreakdown;

    const reviews: Review[] = own
      .filter((r) => r.review.trim())
      .map((r) => ({
        userId: r.profile_id,
        rating: Math.round((r.taste + r.hygiene + r.value + r.vibe) / 4),
        text: r.review,
        date: r.created_at.slice(0, 10),
        author: r.author ?? undefined,
      }));

    const mine = me ? fresh.find((r) => r.profile_id === me.id) : undefined;
    const guessed = matchCuisine(row.name, row.tags.map((t) => t.toLowerCase()));
    const stallVouches = vouches.filter((v) => v.stall_id === row.id);

    return {
      id: row.id,
      name: row.name,
      vendorName: row.vendor_name,
      vendorAvatar: row.vendor_avatar,
      vendorQuote: row.vendor_quote,
      area: row.area,
      lat: row.lat,
      lng: row.lng,
      emoji: row.emoji !== "🍽️" ? row.emoji : guessed.emoji,
      hue: row.hue,
      dish: (row.dish as Stall["dish"]) ?? guessed.dish,
      tags: row.tags,
      veg: row.veg,
      avgPrice: row.avg_price,
      timings: row.timings,
      ratings: combined,
      ratingCount: total,
      verified: row.verified,
      suggestedBy: row.suggester?.handle,
      since: row.since,
      dishes: row.dishes,
      aiSummary: row.ai_summary,
      reviews,
      campaignId: row.campaign_id ?? undefined,
      status: row.status,
      vouches: stallVouches.length,
      viewerVouched: me ? stallVouches.some((v) => v.profile_id === me.id) : false,
      hasOwner: Boolean(row.owner_id),
      ownedByViewer: Boolean(me && row.owner_id === me.id),
      viewerRating: mine && {
        taste: mine.taste,
        hygiene: mine.hygiene,
        value: mine.value,
        vibe: mine.vibe,
        review: mine.review,
      },
    } satisfies Stall;
  });
});

const loadCampaigns = cache(async (): Promise<Campaign[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.from("campaigns").select("*");
  if (error) fail("campaigns", error);
  const today = new Date(new Date().toISOString().slice(0, 10)).getTime();
  return (data as CampaignRow[]).map((c) => ({
    id: c.id,
    stallId: c.stall_id,
    title: c.title,
    shortGoal: c.short_goal,
    story: c.story,
    goal: c.goal,
    raised: c.raised,
    backers: c.backers,
    endsInDays: Math.max(0, Math.round((new Date(c.ends_on).getTime() - today) / DAY_MS)),
    costBreakdown: c.cost_breakdown,
    revenueShare: c.revenue_share,
    milestones: c.milestones,
    insight: c.insight,
    updates: c.updates,
  }));
});

const loadCritics = cache(async (): Promise<Critic[]> => {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("leaderboard");
  if (error) fail("leaderboard", error);
  type Row = ProfileRow & { taste_score: number; reviews: number; found: number; followers: number; badges: Critic["badges"] };
  return (data as Row[])
    .map((r) => ({
      id: r.id,
      name: r.name,
      handle: r.handle,
      avatar: r.avatar,
      area: r.area as Critic["area"],
      persona: r.persona,
      tasteScore: r.taste_score,
      reviews: r.reviews,
      stallsSuggested: r.found,
      followers: r.followers,
      badges: r.badges,
    }))
    .sort((a, b) => b.tasteScore - a.tasteScore);
});

export const liveSource: DataSource = {
  mode: "live",
  listStalls: loadStalls,
  async getStall(id) {
    return (await loadStalls()).find((s) => s.id === id);
  },
  listCampaigns: loadCampaigns,
  async getCampaign(id) {
    return (await loadCampaigns()).find((c) => c.id === id);
  },
  listCritics: loadCritics,
  async getViewer(): Promise<Viewer | null> {
    const me = await getMyProfile();
    if (!me) return null;

    const supabase = await createClient();
    const [backingsRes, txnsRes, critics, campaigns, stalls] = await Promise.all([
      supabase.from("backings").select("campaign_id, amount"),
      supabase
        .from("wallet_txns")
        .select("kind, amount, label, stall_id, campaign_id, created_at")
        .order("created_at", { ascending: false }),
      loadCritics(),
      loadCampaigns(),
      loadStalls(),
    ]);
    if (backingsRes.error) fail("your backings", backingsRes.error);
    if (txnsRes.error) fail("your wallet", txnsRes.error);

    type Txn = { kind: WalletTxn["kind"]; amount: number; label: string; stall_id: string | null; campaign_id: string | null; created_at: string };
    const txns = txnsRes.data as Txn[];
    const sum = (kinds: WalletTxn["kind"][], filter: (t: Txn) => boolean = () => true) =>
      txns.filter((t) => kinds.includes(t.kind) && filter(t)).reduce((s, t) => s + t.amount, 0);

    const credits: Record<string, number> = {};
    for (const t of txns) {
      if ((t.kind === "credit" || t.kind === "redeemed") && t.stall_id) credits[t.stall_id] = (credits[t.stall_id] ?? 0) + t.amount;
    }
    for (const id of Object.keys(credits)) if (credits[id] <= 0) delete credits[id];

    const stakes = new Map<string, number>();
    for (const b of backingsRes.data as { campaign_id: string; amount: number }[]) {
      stakes.set(b.campaign_id, (stakes.get(b.campaign_id) ?? 0) + b.amount);
    }
    const backings = [...stakes].flatMap(([campaignId, amount]) => {
      const campaign = campaigns.find((c) => c.id === campaignId);
      const stall = campaign && stalls.find((s) => s.id === campaign.stallId);
      if (!campaign || !stall) return [];
      return [{
        campaignId,
        amount,
        earned: sum(["earning"], (t) => t.campaign_id === campaignId),
        credit: credits[stall.id] ?? 0,
        campaign,
        stall,
      }];
    });

    const fromBoard = critics.find((c) => c.id === me.id);
    return {
      critic: fromBoard ?? {
        ...me,
        area: me.area as Critic["area"],
        tasteScore: 0,
        reviews: 0,
        stallsSuggested: 0,
        followers: 0,
        badges: [],
      },
      backings,
      history: txns.map((t) => ({ date: t.created_at.slice(0, 10), label: t.label, amount: t.amount, kind: t.kind })),
      playMoney: sum(["topup", "backing"]),
      withdrawable: sum(["earning", "withdrawal"]),
      totalEarned: sum(["earning"]),
      credits,
    };
  },
  async getVendor() {
    const me = await getMyProfile();
    if (!me) return null;
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("vendor_dashboard");
    if (error) fail("your stall", error);
    if (!data) return null;

    type Dashboard = {
      stall_id: string;
      backers: { name: string; handle: string; avatar: string; amount: number; last_at: string }[];
      redemptions: { name: string; avatar: string; amount: number; used_at: string }[];
    };
    const d = data as Dashboard;
    const [stalls, campaigns] = await Promise.all([loadStalls(), loadCampaigns()]);
    const stall = stalls.find((s) => s.id === d.stall_id);
    if (!stall) return null;
    return {
      stall,
      campaign: stall.campaignId ? campaigns.find((c) => c.id === stall.campaignId) : undefined,
      backers: d.backers.map((b) => ({ ...b, date: b.last_at.slice(0, 10) })),
      redemptions: d.redemptions.map((r) => ({ name: r.name, avatar: r.avatar, amount: r.amount, date: r.used_at.slice(0, 10) })),
    };
  },
};
