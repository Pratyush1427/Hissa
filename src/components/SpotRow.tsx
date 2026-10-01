import Link from "next/link";
import type { OsmSpot } from "@/lib/types";
import StallPhoto from "./StallPhoto";

export function prettyCuisine(cuisines: string[]) {
  return cuisines
    .slice(0, 2)
    .map((c) => c.replace(/_/g, " ").replace(/^\w/, (ch) => ch.toUpperCase()))
    .join(", ");
}

export default function SpotRow({ spot }: { spot: OsmSpot }) {
  const cuisine = prettyCuisine(spot.cuisines);
  return (
    <Link
      href={`/spots/${spot.id}`}
      className="flex items-center gap-3 rounded-2xl border-2 border-line bg-surface p-3 transition active:scale-[0.99]"
    >
      {spot.dish ? (
        <StallPhoto stall={spot} className="size-11 shrink-0 rounded-full" />
      ) : (
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-background text-xl">{spot.emoji}</span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{spot.name}</p>
        <p className="truncate text-xs text-muted">
          {spot.locality}
          {cuisine && ` · ${cuisine}`}
        </p>
      </div>
      <span className="shrink-0 rounded-full border border-dashed border-steel px-2 py-0.5 text-xs text-muted">
        Taste it first
      </span>
    </Link>
  );
}
