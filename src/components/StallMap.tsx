"use client";

import "leaflet/dist/leaflet.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import L from "leaflet";
import { setWorkerUrl } from "maplibre-gl";
import Link from "next/link";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, useMap } from "react-leaflet";
import type { MapPin } from "@/lib/types";

// OpenFreeMap "Liberty": soft colours with blue water. Free and open, with no key, signup or
// domain registration, so the map works the same on localhost and on any deployed URL.
const BASEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const BASEMAP_ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/" target="_blank">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>';

// Served from /public (see scripts/copy-maplibre-worker.mjs); the bundled default URL doesn't resolve.
setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

function Basemap() {
  const map = useMap();
  useEffect(() => {
    const layer = maplibreGL({ style: BASEMAP_STYLE });
    layer.addTo(map);
    map.attributionControl.addAttribution(BASEMAP_ATTRIBUTION);
    return () => {
      map.removeLayer(layer);
      map.attributionControl.removeAttribution(BASEMAP_ATTRIBUTION);
    };
  }, [map]);
  return null;
}

const BENGALURU: [number, number] = [12.9616, 77.6007];

function icon(pin: MapPin) {
  return L.divIcon({
    className: `stall-pin ${pin.kind === "osm" ? "stall-pin--osm" : ""}`,
    html: `<span>${pin.emoji}</span>`,
    iconSize: pin.kind === "osm" ? [26, 26] : [36, 36],
    iconAnchor: pin.kind === "osm" ? [13, 13] : [18, 18],
  });
}

export default function StallMap({
  pins,
  center = BENGALURU,
  zoom = 12,
}: {
  pins: MapPin[];
  center?: [number, number];
  zoom?: number;
}) {
  return (
    <MapContainer center={center} zoom={zoom} className="h-full w-full" scrollWheelZoom>
      <Basemap />
      {/* Hissa stalls render last so they sit on top of OSM pins. */}
      {[...pins]
        .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "osm" ? -1 : 1))
        .map((pin) => (
          <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={icon(pin)}>
            <Popup>
              <Link href={pin.href} className="font-semibold">
                {pin.name}
              </Link>
              <br />
              {pin.subtitle}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
