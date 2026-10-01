"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { backCampaign } from "@/app/actions";
import { formatINR } from "@/lib/format";
import type { Mode } from "@/lib/mode";
import type { Campaign, Stall } from "@/lib/types";
import BottomSheet from "./BottomSheet";

const PRESETS = [500, 1000, 2500, 5000];
const ASSUMED_GROWTH = 0.25;

export default function BackSheet({
  campaign,
  stall,
  mode,
  signedIn,
  playMoney,
}: {
  campaign: Campaign;
  stall: Stall;
  mode: Mode;
  signedIn: boolean;
  playMoney: number | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(1000);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const firstName = (stall.vendorName || stall.name).split(" ")[0];
  const funded = campaign.raised >= campaign.goal;
  const closed = campaign.endsInDays <= 0 && !funded;
  const { pctOfGrowth, cap, baselineMonthly } = campaign.revenueShare;
  const monthlyPool = baselineMonthly * ASSUMED_GROWTH * (pctOfGrowth / 100);
  const yourMonthly = Math.round(monthlyPool * (amount / campaign.goal));
  const capAmount = Math.round(amount * cap);
  const months = yourMonthly > 0 ? Math.ceil(capAmount / yourMonthly) : 0;
  const tooMuch = playMoney != null && amount > playMoney;

  function close() {
    setOpen(false);
    setDone(false);
    setError("");
  }

  function confirm() {
    if (mode === "demo") {
      setDone(true);
      return;
    }
    startTransition(async () => {
      const result = await backCampaign(campaign.id, amount);
      if (result.ok) {
        setDone(true);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  if (mode === "live" && !signedIn && !funded) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(`/stalls/${stall.id}#campaign`)}`}
        className="block w-full rounded-2xl bg-brand py-3.5 text-center text-lg font-semibold text-white shadow-md"
      >
        Sign in to back {firstName}
      </Link>
    );
  }

  return (
    <>
      <button
        disabled={funded || closed}
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl bg-brand py-3.5 text-lg font-semibold text-white shadow-md disabled:bg-grow"
      >
        {funded ? `Fully funded by ${campaign.backers} neighbours 🎉` : closed ? "Campaign closed" : `Back ${firstName}`}
      </button>

      {open && (
        <BottomSheet onClose={close}>
          {done ? (
            <div className="space-y-3 py-4 text-center">
              <p className="text-6xl">{stall.vendorAvatar}</p>
              <h3 className="font-display text-2xl">You&apos;re part of {firstName}&apos;s story!</h3>
              <p className="text-muted">
                You&apos;ll get updates as {campaign.shortGoal} comes to life, and a treat at every milestone. Your name
                is now on the neighbours&apos; wall at {stall.name}.
              </p>
              <button onClick={close} className="mt-2 w-full rounded-2xl bg-brand py-3 font-semibold text-white">
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-gold-soft text-2xl">
                  {stall.vendorAvatar}
                </span>
                <div>
                  <h3 className="font-display text-xl leading-tight">Back {firstName}</h3>
                  <p className="text-sm text-muted">for {campaign.shortGoal}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setAmount(p)}
                    className={`rounded-xl border-2 py-2 font-semibold ${
                      amount === p ? "border-brand bg-brand text-white" : "border-line"
                    }`}
                  >
                    {formatINR(p)}
                  </button>
                ))}
              </div>
              {playMoney != null && (
                <p className={`text-sm ${tooMuch ? "font-semibold text-brand" : "text-muted"}`}>
                  {formatINR(playMoney)} of play money left
                </p>
              )}

              <div className="space-y-2 rounded-2xl bg-background p-4 text-sm">
                <p className="font-semibold">What you get back</p>
                <p>🎁 Treats at {firstName}&apos;s stall at every milestone</p>
                <p>
                  🌱 About <b>{formatINR(yourMonthly)}/month</b> if sales grow 25%, until you&apos;ve received{" "}
                  <b>{formatINR(capAmount)}</b> (~{months} months)
                </p>
                <p>🔒 Released to {firstName} only as milestones happen. Refunded if the goal isn&apos;t met.</p>
              </div>

              {error && <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand">{error}</p>}

              <button
                onClick={confirm}
                disabled={pending || tooMuch}
                className="w-full rounded-2xl bg-brand py-3.5 text-lg font-semibold text-white disabled:opacity-60"
              >
                {pending ? "Backing…" : `Back with ${formatINR(amount)}`}
              </button>
              <p className="text-center text-xs text-muted">
                {mode === "live" ? "Play money: no real payment is made" : "Demo: nothing is saved"}
              </p>
            </div>
          )}
        </BottomSheet>
      )}
    </>
  );
}
