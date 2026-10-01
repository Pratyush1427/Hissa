// Demo data source: the hand-written mock world. Nothing here is saved.
import {
  campaigns,
  critics,
  CURRENT_USER_ID,
  DEMO_VENDOR_STALL_ID,
  demoVendorBackers,
  demoVendorRedemptions,
  getCampaign,
  getCritic,
  getStall,
  myBackings,
  stalls,
  walletHistory,
  WITHDRAWN_SO_FAR,
} from "../mock-data";
import type { Stall, Viewer } from "../types";
import type { DataSource } from "./index";

function withAuthors(stall: Stall): Stall {
  return {
    ...stall,
    status: stall.verified ? "live" : "pending",
    hasOwner: stall.verified,
    vouches: stall.verified ? undefined : 2,
    reviews: stall.reviews.map((r) => {
      const c = getCritic(r.userId);
      return c ? { ...r, author: { handle: c.handle, name: c.name, avatar: c.avatar, persona: c.persona } } : r;
    }),
  };
}

export const demoSource: DataSource = {
  mode: "demo",
  async listStalls() {
    return stalls.map(withAuthors);
  },
  async getStall(id) {
    const s = getStall(id);
    return s && withAuthors(s);
  },
  async listCampaigns() {
    return campaigns;
  },
  async getCampaign(id) {
    return getCampaign(id);
  },
  async listCritics() {
    return [...critics].sort((a, b) => b.tasteScore - a.tasteScore);
  },
  async getViewer(): Promise<Viewer> {
    const backings = myBackings.map((b) => {
      const campaign = getCampaign(b.campaignId)!;
      return { ...b, campaign, stall: withAuthors(getStall(campaign.stallId)!) };
    });
    const totalEarned = backings.reduce((sum, b) => sum + b.earned, 0);
    return {
      critic: getCritic(CURRENT_USER_ID)!,
      backings,
      history: walletHistory,
      playMoney: null,
      withdrawable: totalEarned - WITHDRAWN_SO_FAR,
      totalEarned,
      credits: Object.fromEntries(backings.filter((b) => b.credit > 0).map((b) => [b.stall.id, b.credit])),
    };
  },
  async getVendor() {
    const stall = withAuthors(getStall(DEMO_VENDOR_STALL_ID)!);
    return {
      stall: { ...stall, ownedByViewer: true },
      campaign: stall.campaignId ? getCampaign(stall.campaignId) : undefined,
      backers: demoVendorBackers,
      redemptions: demoVendorRedemptions,
    };
  },
};
