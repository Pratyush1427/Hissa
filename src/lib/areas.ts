import type { Area } from "./types";

export const AREAS: Area[] = [
  "Basavanagudi",
  "Malleshwaram",
  "VV Puram",
  "Shivajinagar",
  "Jayanagar",
  "Koramangala",
  "HSR Layout",
  "Indiranagar",
];

// Rough neighbourhood centres, used to place stalls that don't have an exact location yet.
export const AREA_CENTRES: Record<Area, [number, number]> = {
  Basavanagudi: [12.9422, 77.5737],
  Malleshwaram: [13.0035, 77.571],
  "VV Puram": [12.9496, 77.5736],
  Shivajinagar: [12.9857, 77.6057],
  Jayanagar: [12.925, 77.5838],
  Koramangala: [12.9352, 77.6245],
  "HSR Layout": [12.9116, 77.6474],
  Indiranagar: [12.9784, 77.6408],
};
