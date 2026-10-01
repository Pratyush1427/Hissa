"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { MapPin } from "@/lib/types";

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
      {/* Stadia "Alidade Smooth": light basemap with blue water. Keyless on localhost; a deployed
          domain must be registered (free) at stadiamaps.com. Attribution is required. */}
      <TileLayer
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
        maxZoom={20}
      />
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
