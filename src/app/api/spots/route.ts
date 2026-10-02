import { getOsmSpots } from "@/lib/osm";

// The live OpenStreetMap spots, served once a day as a cached file instead of being
// embedded in every Discover page. Only the fields lists and map pins need.
export const revalidate = 86400;

export async function GET() {
  const spots = await getOsmSpots();
  const slim = spots.map(({ id, name, lat, lng, emoji, dish, cuisines, locality }) => ({
    id,
    name,
    lat: Math.round(lat * 1e5) / 1e5,
    lng: Math.round(lng * 1e5) / 1e5,
    emoji,
    dish,
    cuisines,
    locality,
  }));
  return Response.json(slim, {
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400" },
  });
}
