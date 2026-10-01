import Link from "next/link";
import { percent } from "@/lib/format";
import type { Campaign, Stall } from "@/lib/types";
import Neighbours from "./Neighbours";
import ProgressBar from "./ProgressBar";
import StallPhoto from "./StallPhoto";

// A vendor's growth story, told person-first. Money detail lives one tap deeper.
export default function StoryCard({ stall, campaign }: { stall: Stall; campaign: Campaign }) {
  const pct = percent(campaign.raised, campaign.goal);
  return (
    <Link
      href={`/stalls/${stall.id}#campaign`}
      className="block w-72 shrink-0 overflow-hidden rounded-3xl border-2 border-line bg-surface shadow-sm"
    >
      <div className="relative">
        <StallPhoto stall={stall} className="h-32" />
        <span className="absolute -bottom-6 left-4 grid size-14 place-items-center rounded-full border-4 border-surface bg-gold-soft text-3xl">
          {stall.vendorAvatar}
        </span>
      </div>
      <div className="space-y-2 p-4 pt-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {stall.vendorName} · {stall.area}
        </p>
        <p className="font-display text-lg leading-snug">
          Help {stall.vendorName.split(" ")[0]} get {campaign.shortGoal}
        </p>
        <ProgressBar value={pct} />
        <div className="flex items-center justify-between">
          <Neighbours count={campaign.backers} label="neighbours" />
          <span className="text-sm font-semibold text-brand">{pct}%</span>
        </div>
      </div>
    </Link>
  );
}
