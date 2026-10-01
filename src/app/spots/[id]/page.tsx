import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import MiniMap from "@/components/MiniMap";
import StallPhoto from "@/components/StallPhoto";
import { prettyCuisine } from "@/components/SpotRow";
import { getOsmSpot } from "@/lib/osm";

export default async function SpotPage({ params }: PageProps<"/spots/[id]">) {
  const { id } = await params;
  const spot = await getOsmSpot(id);
  if (!spot) notFound();

  const cuisine = prettyCuisine(spot.cuisines);
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`;
  const suggestHref = `/suggest?${new URLSearchParams({ spot: spot.id, name: spot.name, area: spot.locality })}`;

  return (
    <main className="flex-1 md:mx-auto md:w-full md:max-w-2xl md:pt-6">
      <div className="relative">
        {spot.dish ? (
          <StallPhoto stall={spot} className="h-52" credit />
        ) : (
          <div className="grid h-44 place-items-center bg-gradient-to-br from-line to-background">
            <span className="text-7xl opacity-80">{spot.emoji}</span>
          </div>
        )}
        <p className="absolute left-1/2 top-4 -translate-x-1/2 whitespace-nowrap rounded-full bg-surface/90 px-3 py-1 text-xs text-muted">
          📷 No photos of this spot yet
        </p>
        <Link
          href="/"
          className="absolute left-4 top-4 grid size-10 place-items-center rounded-full bg-surface/95 shadow"
          aria-label="Back to discover"
        >
          <ArrowLeft className="size-5" />
        </Link>
      </div>

      <div className="space-y-5 px-4 py-5">
        <section className="space-y-1">
          <h1 className="font-display text-3xl leading-tight">{spot.name}</h1>
          <p className="text-sm text-muted">
            {spot.locality}
            {cuisine && ` · ${cuisine}`}
          </p>
          {spot.address && <p className="text-sm text-muted">📍 {spot.address}</p>}
          {spot.openingHours && <p className="text-sm text-muted">🕒 {spot.openingHours}</p>}
        </section>

        <section className="space-y-3 rounded-3xl border-2 border-dashed border-gold bg-gold-soft/50 p-5">
          <p className="font-display text-xl">Nobody on Hissa has tasted this yet</p>
          <p className="text-sm text-muted">
            Been here? Add a photo and your rating. Once a few critics vouch, it becomes a Hissa stall, and you get
            the <b>Found It First</b> badge.
          </p>
          <Link
            href={suggestHref}
            className="block w-full rounded-2xl bg-brand py-3.5 text-center text-lg font-semibold text-white"
          >
            📸 Be the first critic
          </Link>
        </section>

        <MiniMap
          pin={{
            id: spot.id,
            name: spot.name,
            lat: spot.lat,
            lng: spot.lng,
            emoji: spot.emoji,
            href: `/spots/${spot.id}`,
            subtitle: spot.locality,
            kind: "hissa",
          }}
        />

        <section className="flex flex-wrap gap-2 text-sm">
          <a href={directions} target="_blank" rel="noreferrer" className="rounded-full border border-line bg-surface px-3 py-1.5">
            🧭 Directions
          </a>
          {spot.phone && (
            <a href={`tel:${spot.phone}`} className="rounded-full border border-line bg-surface px-3 py-1.5">
              📞 Call
            </a>
          )}
          {spot.website && (
            <a href={spot.website} target="_blank" rel="noreferrer" className="rounded-full border border-line bg-surface px-3 py-1.5">
              🌐 Website
            </a>
          )}
          {spot.instagram && (
            <a
              href={spot.instagram.startsWith("http") ? spot.instagram : `https://instagram.com/${spot.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-line bg-surface px-3 py-1.5"
            >
              📸 Instagram
            </a>
          )}
        </section>

        <p className="text-[11px] text-muted">
          Listing from{" "}
          <a href={spot.osmUrl} target="_blank" rel="noreferrer" className="underline">
            OpenStreetMap
          </a>{" "}
          · © OpenStreetMap contributors. Spotted a mistake? You can fix it there.
        </p>
      </div>
    </main>
  );
}
