// Live food spots from OpenStreetMap via the Overpass API (free, no key).
// Data © OpenStreetMap contributors, ODbL. Cached for a day to respect Overpass usage limits.
import type { DishKey } from "./dish-photos";
import type { OsmSpot } from "./types";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const ONE_DAY = 60 * 60 * 24;

const QUERY = `[out:json][timeout:60];
area["name"="Bengaluru"]["boundary"="administrative"]->.b;
(
  nwr["amenity"="fast_food"](area.b);
  nwr["amenity"="food_court"](area.b);
  nwr["street_vendor"="yes"](area.b);
);
out tags center;`;

// Chains that are sometimes missing a `brand` tag in OSM.
const CHAIN_PATTERN =
  /domino|kfc|mcdonald|subway|burger king|pizza hut|starbucks|taco bell|wendy|baskin|chai point|faasos|behrouz|box8|wow!? momo|burger singh|haldiram|adyar ananda|a2b|krispy|dunkin|popeyes|la pino|ovenstory|empire|meghana|truffles|polar bear|keventers|natural'?s ice|papa john|eat\.?fit|rebel foods|mojo pizza|lunchbox|sweet truth/i;

const LOCALITIES: [string, number, number][] = [
  ["Basavanagudi", 12.9422, 77.5737],
  ["Malleshwaram", 13.0035, 77.571],
  ["VV Puram", 12.9496, 77.5736],
  ["Shivajinagar", 12.9857, 77.6057],
  ["Jayanagar", 12.925, 77.5838],
  ["Koramangala", 12.9352, 77.6245],
  ["HSR Layout", 12.9116, 77.6474],
  ["Indiranagar", 12.9784, 77.6408],
  ["BTM Layout", 12.9166, 77.6101],
  ["JP Nagar", 12.9063, 77.5857],
  ["Banashankari", 12.9255, 77.5468],
  ["Rajajinagar", 12.9915, 77.5525],
  ["Yeshwanthpur", 13.0285, 77.5409],
  ["Hebbal", 13.0358, 77.597],
  ["MG Road", 12.9756, 77.6067],
  ["Frazer Town", 12.9973, 77.6143],
  ["Whitefield", 12.9698, 77.75],
  ["Marathahalli", 12.9591, 77.6974],
  ["Bellandur", 12.9258, 77.6762],
  ["Electronic City", 12.8452, 77.6602],
  ["Yelahanka", 13.1007, 77.5963],
];

const CUISINE_MATCH: [RegExp, string, DishKey][] = [
  [/juice|shake|smoothie/, "🥤", "juice"],
  [/ice_cream|dessert|falooda/, "🍦", "falooda"],
  [/sweet|mithai/, "🍬", "sweets"],
  [/coffee|(^|[\s_])tea\b|chai/, "☕", "filter-coffee"],
  [/chaat|chat|pani/, "🥗", "masala-puri"],
  [/momo|tibetan|nepali/, "🥟", "momos"],
  [/biryani|biriyani/, "🍚", "biryani"],
  [/kebab|shawarma|arab|grill|tandoor/, "🍢", "seekh-kebab"],
  [/roll|wrap/, "🌯", "roll"],
  [/burger/, "🍔", "burger"],
  [/pizza/, "🍕", "pizza"],
  [/chicken|wings/, "🍗", "chicken"],
  [/sandwich/, "🥪", "sandwich"],
  [/chinese|noodle/, "🍜", "noodles"],
  [/dosa|idli|south_indian|udupi|thindi/, "🥞", "masala-dosa"],
  [/indian|regional|local|punjabi|meals/, "🍛", "meals"],
];

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function nearestLocality(lat: number, lng: number) {
  let best = "Bengaluru";
  let bestDist = Infinity;
  for (const [name, la, ln] of LOCALITIES) {
    // Equirectangular approximation is plenty accurate at city scale.
    const dx = (lng - ln) * Math.cos((lat * Math.PI) / 180);
    const dy = lat - la;
    const km = Math.sqrt(dx * dx + dy * dy) * 111;
    if (km < bestDist) {
      bestDist = km;
      best = name;
    }
  }
  return bestDist <= 3 ? best : "Bengaluru";
}

// Unknown cuisines get no photo rather than a guess.
export function matchCuisine(name: string, cuisines: string[]) {
  const haystack = `${cuisines.join(" ")} ${name}`.toLowerCase();
  const match = CUISINE_MATCH.find(([re]) => re.test(haystack));
  return { emoji: match?.[1] ?? "🍽️", dish: match?.[2] };
}

function toSpot(el: OverpassElement): OsmSpot | null {
  const tags = el.tags ?? {};
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  const name = tags.name ?? tags["name:en"];
  if (!name || lat === undefined || lng === undefined) return null;
  if (tags.brand || tags["brand:wikidata"] || CHAIN_PATTERN.test(name)) return null;
  if (tags.amenity !== "fast_food" && tags.amenity !== "food_court" && !tags.cuisine) return null;

  const cuisines = (tags.cuisine ?? "")
    .split(";")
    .map((c) => c.trim())
    .filter(Boolean);
  const address = [tags["addr:housenumber"], tags["addr:street"], tags["addr:suburb"]]
    .filter(Boolean)
    .join(", ");

  return {
    id: `${el.type}-${el.id}`,
    name,
    lat,
    lng,
    ...matchCuisine(name, cuisines),
    cuisines,
    locality: nearestLocality(lat, lng),
    address: address || undefined,
    openingHours: tags.opening_hours,
    phone: tags.phone ?? tags["contact:phone"],
    website: tags.website ?? tags["contact:website"],
    instagram: tags["contact:instagram"],
    osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
  };
}

function richness(s: OsmSpot) {
  return (s.cuisines.length > 0 ? 2 : 0) + (s.openingHours ? 1 : 0) + (s.address ? 1 : 0);
}

export async function getOsmSpots(): Promise<OsmSpot[]> {
  try {
    const res = await fetch(`${OVERPASS_URL}?data=${encodeURIComponent(QUERY)}`, {
      headers: { "User-Agent": "Hissa/0.1 (hackathon prototype)" },
      next: { revalidate: ONE_DAY },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return [];
    const data: { elements: OverpassElement[] } = await res.json();
    const seen = new Set<string>();
    return data.elements
      .map(toSpot)
      .filter((s): s is OsmSpot => {
        if (!s) return false;
        // Drop duplicate pins of the same place mapped twice.
        const key = `${s.name.toLowerCase()}|${s.lat.toFixed(3)}|${s.lng.toFixed(3)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      // Spots with more detail first, so the list doesn't open on bare "1522 Street"-style entries.
      .sort((a, b) => richness(b) - richness(a) || a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export async function getOsmSpot(id: string) {
  const spots = await getOsmSpots();
  return spots.find((s) => s.id === id);
}
