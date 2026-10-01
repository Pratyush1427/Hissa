"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { acceptRedeemCode } from "@/app/actions";
import { formatINR } from "@/lib/format";
import type { Mode } from "@/lib/mode";

type Accepted = { amount: number; name: string; avatar: string };

// The vendor types the 6-digit code a customer shows at the counter.
export default function RedeemCodeBox({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [accepted, setAccepted] = useState<Accepted | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const ready = /^\d{6}$/.test(code);

  function accept() {
    setError("");
    if (mode === "demo") {
      setAccepted({ amount: 100, name: "Meera Iyer", avatar: "👵🏽" });
      return;
    }
    startTransition(async () => {
      const result = await acceptRedeemCode(code);
      if (result.ok) {
        setAccepted(result.data);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  if (accepted) {
    return (
      <div className="space-y-2 rounded-3xl border-2 border-grow bg-grow-soft p-5 text-center">
        <p className="text-5xl">{accepted.avatar}</p>
        <p className="font-display text-2xl text-grow">✓ {formatINR(accepted.amount)} treat accepted</p>
        <p className="text-muted">
          for {accepted.name}. Take {formatINR(accepted.amount)} off their bill.
          {mode === "demo" && " (Demo: any 6 digits work.)"}
        </p>
        <button
          onClick={() => {
            setAccepted(null);
            setCode("");
          }}
          className="mt-2 w-full rounded-2xl bg-grow py-3 font-semibold text-white"
        >
          Next customer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-3xl border-2 border-brand bg-surface p-5">
      <p className="font-display text-xl">Customer has a treat code?</p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="••••••"
        aria-label="6-digit treat code"
        className="w-full rounded-2xl border-2 border-line bg-background py-3 text-center font-mono text-4xl tracking-[0.4em] outline-none focus:border-brand"
      />
      {error && <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand">{error}</p>}
      <button
        onClick={accept}
        disabled={!ready || pending}
        className="w-full rounded-2xl bg-brand py-3.5 text-lg font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Checking…" : "Accept code"}
      </button>
    </div>
  );
}
