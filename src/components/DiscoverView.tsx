"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { AREAS } from "@/lib/areas";
import { overallRating } from "@/lib/format";
import type { Area, Campaign, MapPin, OsmSpot, Stall } from "@/lib/types";
import SpotRow, { prettyCuisine } from "./SpotRow";
import StallCard from "./StallCard";

// Leaflet touches `window`, so the map only renders in the browser.
const StallMap = dynamic(() => import("./StallMap"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-sm text-muted">Loading map…</div>,
});

const PAGE_SIZE = 20;
const MAX_MAP_SPOTS = 400;

export default function DiscoverView({
  stalls,
  spots,
  campaigns,
}: {
  stalls: Stall[];
  spots: OsmSpot[];
  campaigns: Campaign[];
}) {
  const campaignById = useMemo(() => new Map(campaigns.map((c) => [c.id, c])), [campaigns]);
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<Area | "All">("All");
  const [vegOnly, setVegOnly] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const [spotLimit, setSpotLimit] = useState(PAGE_SIZE);

  const q = query.trim().toLowerCase();

  const filteredStalls = useMemo(
    () =>
      stalls
        .filter((s) => area === "All" || s.area === area)
        .filter((s) => !vegOnly || s.veg)
        .filter(
          (s) =>
            !q ||
            s.name.toLowerCase().includes(q) ||
            s.tags.some((t) => t.toLowerCase().includes(q)) ||
            s.dishes.some((d) => d.name.toLowerCase().includes(q)),
        )
        .sort((a, b) => overallRating(b.ratings) - overallRating(a.ratings)),
    [stalls, q, area, vegOnly],
  );

  // OSM rarely records veg status, so the veg filter only applies to Hissa stalls.
  const filteredSpots = useMemo(
    () =>
      spots
        .filter((s) => area === "All" || s.locality === area)
        .filter((s) => !q || s.name.toLowerCase().includes(q) || s.cuisines.some((c) => c.includes(q))),
    [spots, q, area],
  );

  const pins: MapPin[] = useMemo(
    () => [
      ...filteredSpots.slice(0, MAX_MAP_SPOTS).map((s) => ({
        id: s.id,
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        emoji: s.emoji,
        href: `/spots/${s.id}`,
        subtitle: `Unrated · ${prettyCuisine(s.cuisines) || s.locality}`,
        kind: "osm" as const,
      })),
      // Suggested stalls may not have a location yet, so they stay off the map.
      ...filteredStalls.flatMap((s) => {
        if (s.lat == null || s.lng == null) return [];
        const rating = overallRating(s.ratings);
        return [
          {
            id: s.id,
            name: s.name,
            lat: s.lat,
            lng: s.lng,
            emoji: s.emoji,
            href: `/stalls/${s.id}`,
            subtitle: `${rating ? `★ ${rating}` : "New"} · ${s.area}`,
            kind: "hissa" as const,
          },
        ];
      }),
    ],
    [filteredStalls, filteredSpots],
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="sticky top-0 z-[500] space-y-3 bg-background/95 px-4 pb-3 pt-2 backdrop-blur md:top-[66px] md:px-6">
        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSpotLimit(PAGE_SIZE);
            }}
            placeholder="Search dosa, momos, chaat…"
            className="min-w-0 flex-1 rounded-xl border-2 border-line bg-surface px-3 py-2.5 outline-none focus:border-brand"
          />
          <div className="flex rounded-xl border-2 border-line bg-surface p-1 text-sm font-semibold">
            {(["list", "map"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-lg px-3 capitalize ${view === v ? "bg-brand text-white" : "text-muted"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          <button
            onClick={() => setVegOnly((v) => !v)}
            className={`shrink-0 rounded-full border-2 px-3 py-1 text-sm font-semibold ${
              vegOnly ? "border-grow bg-grow text-white" : "border-line bg-surface text-muted"
            }`}
          >
            Veg only
          </button>
          {(["All", ...AREAS] as const).map((a) => (
            <button
              key={a}
              onClick={() => {
                setArea(a);
                setSpotLimit(PAGE_SIZE);
              }}
              className={`shrink-0 rounded-full border-2 px-3 py-1 text-sm font-semibold ${
                area === a ? "border-brand bg-brand text-white" : "border-line bg-surface text-muted"
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {view === "map" ? (
        <div className="relative z-0 mx-4 mb-4 h-[62dvh] overflow-hidden rounded-2xl border border-line md:mx-6 md:h-[72dvh]">
          <StallMap pins={pins} />
          <p className="pointer-events-none absolute left-2 top-2 z-[400] rounded-full bg-surface/90 px-2 py-1 text-[11px] text-muted shadow">
            Red pins: Hissa stalls · Grey: waiting to be discovered
          </p>
        </div>
      ) : (
        <div className="space-y-6 px-4 pb-4 md:px-6">
          <section className="space-y-3">
            <h2 className="font-display text-xl">Loved by Bengaluru</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredStalls.map((stall) => (
              <StallCard key={stall.id} stall={stall} campaign={stall.campaignId ? campaignById.get(stall.campaignId) : undefined} />
            ))}
            </div>
            {filteredStalls.length === 0 && (
              <p className="py-6 text-center text-sm text-muted">No Hissa stalls match yet.</p>
            )}
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="font-display text-xl">Waiting to be discovered</h2>
              <p className="text-sm text-muted">
                {filteredSpots.length} spots nearby that no one on Hissa has tasted yet. Be the first critic and
                bring them in.
              </p>
            </div>
            {spots.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-line p-4 text-center text-sm text-muted">
                Live spots are unavailable right now. Try again in a bit.
              </p>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {filteredSpots.slice(0, spotLimit).map((spot) => (
                    <SpotRow key={spot.id} spot={spot} />
                  ))}
                </div>
                {spotLimit < filteredSpots.length && (
                  <button
                    onClick={() => setSpotLimit((n) => n + PAGE_SIZE)}
                    className="w-full rounded-xl border border-line bg-surface py-2.5 text-sm font-medium"
                  >
                    Show more ({filteredSpots.length - spotLimit} left)
                  </button>
                )}
              </>
            )}
            <p className="text-center text-[11px] text-muted">Data © OpenStreetMap contributors</p>
          </section>
        </div>
      )}
    </div>
  );
}
