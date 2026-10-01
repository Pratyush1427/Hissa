import SuggestFlow from "@/components/SuggestFlow";
import { getData } from "@/lib/data";
import { getOsmSpot } from "@/lib/osm";

export default async function SuggestPage({ searchParams }: PageProps<"/suggest">) {
  const { spot, name, area } = await searchParams;
  const data = await getData();
  const viewer = await data.getViewer();

  // Coming from an OpenStreetMap spot: carry its name, area and map position over.
  const osm = typeof spot === "string" ? await getOsmSpot(spot) : undefined;
  const prefill =
    typeof spot === "string" && typeof name === "string"
      ? {
          spotId: spot,
          name,
          area: typeof area === "string" ? area : "Bengaluru",
          lat: osm?.lat,
          lng: osm?.lng,
        }
      : undefined;

  // `key` resets the flow when switching between prefilled spots.
  return (
    <SuggestFlow key={prefill?.spotId ?? "new"} prefill={prefill} mode={data.mode} signedIn={Boolean(viewer)} />
  );
}
