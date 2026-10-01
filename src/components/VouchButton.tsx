"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { vouchStall } from "@/app/actions";
import type { Mode } from "@/lib/mode";
import { VOUCH_THRESHOLD, type Stall } from "@/lib/types";
import ProgressBar from "./ProgressBar";

// A new find goes live once enough critics vouch that it's real and worth eating at.
export default function VouchButton({ stall, mode, signedIn }: { stall: Stall; mode: Mode; signedIn: boolean }) {
  const router = useRouter();
  const [vouches, setVouches] = useState(stall.vouches ?? 0);
  const [vouched, setVouched] = useState(Boolean(stall.viewerVouched));
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function vouch() {
    if (mode === "demo") {
      setVouches((v) => v + 1);
      setVouched(true);
      return;
    }
    startTransition(async () => {
      const result = await vouchStall(stall.id);
      if (result.ok) {
        setVouches(result.data.vouches);
        setVouched(true);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <section className="space-y-3 rounded-3xl border-2 border-dashed border-gold bg-gold-soft/50 p-5">
      <p className="font-display text-xl">A new find, waiting for vouches</p>
      <p className="text-muted">
        {stall.suggestedBy ? `@${stall.suggestedBy} found this stall. ` : ""}
        It goes live on Hissa once {VOUCH_THRESHOLD} critics vouch they&apos;ve eaten here.
      </p>
      <ProgressBar value={(Math.min(vouches, VOUCH_THRESHOLD) / VOUCH_THRESHOLD) * 100} />
      <p className="text-sm font-semibold">
        {Math.min(vouches, VOUCH_THRESHOLD)} of {VOUCH_THRESHOLD} vouches
      </p>
      {error && <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand">{error}</p>}
      {mode === "live" && !signedIn ? (
        <Link
          href={`/login?next=${encodeURIComponent(`/stalls/${stall.id}`)}`}
          className="block w-full rounded-2xl bg-brand py-3 text-center font-semibold text-white"
        >
          Sign in to vouch
        </Link>
      ) : vouched ? (
        <p className="rounded-2xl bg-grow-soft py-3 text-center font-semibold text-grow">
          {vouches >= VOUCH_THRESHOLD ? "🎉 It's live! Thanks for vouching." : "✓ You vouched for this stall"}
        </p>
      ) : (
        <button
          onClick={vouch}
          disabled={pending}
          className="w-full rounded-2xl bg-brand py-3 font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Vouching…" : "I've eaten here, vouch for it"}
        </button>
      )}
    </section>
  );
}
