import type { RatingBreakdown } from "./types";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(amount: number) {
  return inr.format(amount);
}

export function overallRating(r: RatingBreakdown) {
  return Math.round(((r.taste + r.hygiene + r.value + r.vibe) / 4) * 10) / 10;
}

export function percent(part: number, whole: number) {
  return Math.min(100, Math.round((part / whole) * 100));
}
