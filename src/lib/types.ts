import type { DishKey } from "./dish-photos";

export type Area =
  | "Basavanagudi"
  | "Malleshwaram"
  | "VV Puram"
  | "Shivajinagar"
  | "Jayanagar"
  | "Koramangala"
  | "HSR Layout"
  | "Indiranagar";

export type RatingBreakdown = {
  taste: number;
  hygiene: number;
  value: number;
  vibe: number;
};

export type Dish = { name: string; price: number };

export type ReviewAuthor = { handle: string; name: string; avatar: string; persona: string };

export type Review = {
  userId: string;
  rating: number;
  text: string;
  date: string;
  author?: ReviewAuthor;
};

export type RatingInput = RatingBreakdown & { review: string };

export type Stall = {
  id: string;
  name: string;
  vendorName: string;
  vendorAvatar: string;
  vendorQuote: string;
  area: Area | string;
  lat: number | null;
  lng: number | null;
  emoji: string;
  hue: number;
  dish?: DishKey;
  tags: string[];
  veg: boolean;
  avgPrice: number;
  timings: string;
  ratings: RatingBreakdown;
  ratingCount: number;
  verified: boolean;
  /** Handle of the critic who found it */
  suggestedBy?: string;
  since: number | null;
  dishes: Dish[];
  aiSummary: string;
  reviews: Review[];
  campaignId?: string;
  /** Live mode: "pending" until enough critics vouch */
  status?: "live" | "pending";
  vouches?: number;
  viewerVouched?: boolean;
  viewerRating?: RatingInput;
  /** Live mode: a vendor has claimed this stall */
  hasOwner?: boolean;
  ownedByViewer?: boolean;
};

export type MilestoneStatus = "done" | "in_progress" | "locked";

export type Milestone = {
  title: string;
  reward: string;
  releasePct: number;
  status: MilestoneStatus;
};

export type CampaignUpdate = { date: string; emoji: string; text: string };

export type Campaign = {
  id: string;
  stallId: string;
  title: string;
  /** Fits "Help Manjunath get ___" */
  shortGoal: string;
  story: string;
  goal: number;
  raised: number;
  backers: number;
  endsInDays: number;
  costBreakdown: { item: string; amount: number }[];
  revenueShare: { pctOfGrowth: number; cap: number; baselineMonthly: number };
  milestones: Milestone[];
  insight: { summary: string; signals: string[]; risks: string[] };
  updates: CampaignUpdate[];
};

export type Badge = { emoji: string; title: string };

export type Critic = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  area: Area;
  persona: string;
  tasteScore: number;
  reviews: number;
  stallsSuggested: number;
  followers: number;
  badges: Badge[];
};

export type Backing = {
  campaignId: string;
  amount: number;
  earned: number;
  credit: number;
};

export type WalletTxn = {
  date: string;
  label: string;
  amount: number;
  kind: "topup" | "earning" | "credit" | "backing" | "withdrawal" | "redeemed";
};

export type ViewerBacking = Backing & { campaign: Campaign; stall: Stall };

/** The person using the app: the mock "you" in demo mode, the signed-in player in live mode. */
export type Viewer = {
  critic: Critic;
  backings: ViewerBacking[];
  history: WalletTxn[];
  /** Live mode only: play money left for backing stalls */
  playMoney: number | null;
  withdrawable: number;
  totalEarned: number;
  /** Food credit left, per stall id */
  credits: Record<string, number>;
};

export const VOUCH_THRESHOLD = 3;

export type VendorBacker = { name: string; handle: string; avatar: string; amount: number; date: string };
export type VendorRedemption = { name: string; avatar: string; amount: number; date: string };

/** What a vendor sees about their own stall, including private data like who backed them. */
export type VendorDashboard = {
  stall: Stall;
  campaign?: Campaign;
  backers: VendorBacker[];
  redemptions: VendorRedemption[];
};

// A food spot pulled live from OpenStreetMap. Unrated until a critic brings it into Hissa.
export type OsmSpot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  emoji: string;
  dish?: DishKey;
  cuisines: string[];
  locality: string;
  address?: string;
  openingHours?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  osmUrl: string;
};

/** What Discover needs per spot; the full record is only loaded on the spot's own page. */
export type OsmSpotSummary = Pick<OsmSpot, "id" | "name" | "lat" | "lng" | "emoji" | "dish" | "cuisines" | "locality">;

export type MapPin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  emoji: string;
  href: string;
  subtitle: string;
  kind: "hissa" | "osm";
};
