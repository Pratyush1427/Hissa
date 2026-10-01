import { getMode, type Mode } from "../mode";
import type { Campaign, Critic, Stall, VendorDashboard, Viewer } from "../types";
import { demoSource } from "./demo";
import { liveSource } from "./live";

export type DataSource = {
  mode: Mode;
  listStalls(): Promise<Stall[]>;
  getStall(id: string): Promise<Stall | undefined>;
  listCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  listCritics(): Promise<Critic[]>;
  /** null when nobody is signed in (live mode only) */
  getViewer(): Promise<Viewer | null>;
  /** The viewer's own stall, or null if they don't run one */
  getVendor(): Promise<VendorDashboard | null>;
};

export async function getData(): Promise<DataSource> {
  return (await getMode()) === "live" ? liveSource : demoSource;
}
