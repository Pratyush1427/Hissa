"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { rateStall } from "@/app/actions";
import type { Mode } from "@/lib/mode";
import type { RatingInput, Stall } from "@/lib/types";
import BottomSheet from "./BottomSheet";

const DIMENSIONS = [
  ["taste", "Taste"],
  ["hygiene", "Hygiene"],
  ["value", "Value"],
  ["vibe", "Vibe"],
] as const;

export default function RateSheet({ stall, mode, signedIn }: { stall: Stall; mode: Mode; signedIn: boolean }) {
  const router = useRouter();
  const existing = stall.viewerRating;
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<RatingInput>(
    existing ?? { taste: 0, hygiene: 0, value: 0, vibe: 0, review: "" },
  );
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const complete = DIMENSIONS.every(([key]) => rating[key] > 0);

  if (mode === "live" && !signedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/stalls/${stall.id}`)}`}
        className="block w-full rounded-2xl border-2 border-brand py-3 text-center font-semibold text-brand"
      >
        Sign in to rate this stall
      </Link>
    );
  }

  function submit() {
    if (mode === "demo") {
      setDone(true);
      return;
    }
    startTransition(async () => {
      const result = await rateStall(stall.id, rating);
      if (result.ok) {
        setDone(true);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border-2 border-brand py-3 font-semibold text-brand"
      >
        {existing ? "★ Update your rating" : "★ Rate this stall"}
      </button>

      {open && (
        <BottomSheet
          onClose={() => {
            setOpen(false);
            setDone(false);
          }}
        >
          {done ? (
            <div className="space-y-3 py-4 text-center">
              <p className="text-5xl">🙏</p>
              <h3 className="font-display text-2xl">Thanks, critic!</h3>
              <p className="text-muted">
                {mode === "live"
                  ? "Your rating is live, and your taste score went up."
                  : "Demo: ratings aren't saved. Switch to Live to rate for real."}
              </p>
              <button onClick={() => setOpen(false)} className="w-full rounded-2xl bg-brand py-3 font-semibold text-white">
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-display text-xl">Rate {stall.name}</h3>
              {DIMENSIONS.map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="font-medium">{label}</span>
                  <div className="flex gap-1" role="radiogroup" aria-label={label}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        role="radio"
                        aria-checked={rating[key] === n}
                        aria-label={`${n} star${n > 1 ? "s" : ""}`}
                        onClick={() => setRating({ ...rating, [key]: n })}
                        className={`text-2xl leading-none ${n <= rating[key] ? "text-gold" : "text-line"}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <textarea
                value={rating.review}
                onChange={(e) => setRating({ ...rating, review: e.target.value })}
                maxLength={500}
                rows={3}
                placeholder="What should people order? Any tips? (optional)"
                className="input"
              />
              {error && <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand">{error}</p>}
              <button
                onClick={submit}
                disabled={!complete || pending}
                className="w-full rounded-2xl bg-brand py-3.5 text-lg font-semibold text-white disabled:opacity-50"
              >
                {pending ? "Saving…" : complete ? "Post rating" : "Tap the stars to rate"}
              </button>
            </div>
          )}
        </BottomSheet>
      )}
    </>
  );
}
