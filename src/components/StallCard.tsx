import Link from "next/link";
import { formatINR, overallRating } from "@/lib/format";
import { VOUCH_THRESHOLD, type Campaign, type Stall } from "@/lib/types";
import StallPhoto from "./StallPhoto";

export default function StallCard({ stall, campaign }: { stall: Stall; campaign?: Campaign }) {
  const raising = campaign && campaign.raised < campaign.goal;
  const rating = overallRating(stall.ratings);
  const pending = stall.status === "pending";

  return (
    <Link
      href={`/stalls/${stall.id}`}
      className="flex gap-3 rounded-2xl border-2 border-line bg-surface p-3 transition active:scale-[0.99]"
    >
      <div className="relative shrink-0">
        <StallPhoto stall={stall} className="size-20 rounded-xl" size="text-4xl" />
        {stall.vendorName && (
          <span className="absolute -bottom-2 -right-2 grid size-8 place-items-center rounded-full border-2 border-surface bg-gold-soft text-base">
            {stall.vendorAvatar}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-[1.05rem] font-semibold leading-tight">{stall.name}</h3>
          <span
            className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold ${
              rating ? "bg-grow text-white" : "border border-dashed border-steel text-muted"
            }`}
          >
            {rating ? `★ ${rating}` : "New"}
          </span>
        </div>
        {stall.vendorName ? (
          <p className="text-sm text-muted">
            by {stall.vendorName}
            {stall.since && ` · since ${stall.since}`}
          </p>
        ) : (
          stall.suggestedBy && <p className="text-sm text-muted">found by @{stall.suggestedBy}</p>
        )}
        <p className="text-sm text-muted">
          {stall.area}
          {stall.avgPrice > 0 && ` · ~${formatINR(stall.avgPrice)}`} · {stall.veg ? "Veg" : "Non-veg"}
        </p>
        {raising && (
          <p className="mt-1.5 inline-block rounded-full bg-gold-soft px-2 py-0.5 text-xs font-semibold text-ink">
            🤝 {campaign.backers} neighbours backing {campaign.shortGoal}
          </p>
        )}
        {pending && (
          <p className="mt-1.5 inline-block rounded-full border border-dashed border-steel px-2 py-0.5 text-xs text-muted">
            New find · {stall.vouches ?? 0} of {VOUCH_THRESHOLD} vouches
          </p>
        )}
      </div>
    </Link>
  );
}
