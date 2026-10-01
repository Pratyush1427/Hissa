"use client";

import dynamic from "next/dynamic";
import type { MapPin } from "@/lib/types";

const StallMap = dynamic(() => import("./StallMap"), { ssr: false });

export default function MiniMap({ pin }: { pin: MapPin }) {
  return (
    <div className="relative z-0 h-44 overflow-hidden rounded-2xl border border-line">
      <StallMap pins={[pin]} center={[pin.lat, pin.lng]} zoom={16} />
    </div>
  );
}
