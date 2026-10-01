"use client";

import { ArrowLeft, FastForward } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { redeemCredit, simulateMonth, withdrawEarnings } from "@/app/actions";
import { formatINR, percent } from "@/lib/format";
import type { Mode } from "@/lib/mode";
import type { Stall, Viewer, WalletTxn } from "@/lib/types";
import BottomSheet from "./BottomSheet";
import ProgressBar from "./ProgressBar";
import StallPhoto from "./StallPhoto";

const MIN_WITHDRAWAL = 100;

type Sheet = { kind: "withdraw" } | { kind: "redeem"; stallId: string } | null;

export default function WalletView({ viewer, mode }: { viewer: Viewer; mode: Mode }) {
  const router = useRouter();
  const { backings } = viewer;
  // Local copies so the screen updates instantly; in live mode the server is also updated and refreshed.
  const [withdrawable, setWithdrawable] = useState(viewer.withdrawable);
  const [totalEarned, setTotalEarned] = useState(viewer.totalEarned);
  const [credits, setCredits] = useState(viewer.credits);
  const [history, setHistory] = useState(viewer.history);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [notice, setNotice] = useState("");
  const [simulating, startSimulating] = useTransition();

  const totalCredit = Object.values(credits).reduce((a, b) => a + b, 0);
  const stallById = new Map(backings.map((b) => [b.stall.id, b.stall]));
  const firstName = (s: Stall) => (s.vendorName || s.name).split(" ")[0];

  function addTxn(txn: Omit<WalletTxn, "date">) {
    setHistory((h) => [{ ...txn, date: new Date().toISOString().slice(0, 10) }, ...h]);
  }

  async function withdraw(amount: number, upi: string): Promise<string | null> {
    if (mode === "live") {
      const result = await withdrawEarnings(amount, upi);
      if (!result.ok) return result.error;
      router.refresh();
    }
    setWithdrawable((w) => w - amount);
    addTxn({ label: `Withdrawn to UPI · ${upi}`, amount: -amount, kind: "withdrawal" });
    return null;
  }

  async function redeem(stall: Stall, amount: number): Promise<{ code?: string; error?: string }> {
    if (mode === "live") {
      // Live: the credit is only spent once the vendor accepts the code at the counter.
      const result = await redeemCredit(stall.id, amount);
      if (!result.ok) return { error: result.error };
      return { code: result.data };
    }
    setCredits((c) => ({ ...c, [stall.id]: (c[stall.id] ?? 0) - amount }));
    addTxn({ label: `Redeemed at ${stall.name}`, amount: -amount, kind: "redeemed" });
    return { code: String(Math.floor(100000 + Math.random() * 900000)) };
  }

  function simulate() {
    startSimulating(async () => {
      const result = await simulateMonth();
      if (!result.ok) {
        setNotice(result.error);
        return;
      }
      if (result.data > 0) {
        setWithdrawable((w) => w + result.data);
        setTotalEarned((t) => t + result.data);
        addTxn({ label: "Revenue share (simulated month)", amount: result.data, kind: "earning" });
        setNotice(`A month passed: stalls you backed sent you ${formatINR(result.data)} 🎉`);
      } else {
        setNotice("Nothing to pay yet. Stalls share growth once their campaign is fully funded.");
      }
      router.refresh();
    });
  }

  return (
    <main className="flex-1 space-y-6 px-4 pt-5 md:mx-auto md:w-full md:max-w-2xl md:px-6">
      <header className="space-y-3">
        <Link href="/profile" className="grid size-10 place-items-center rounded-full border-2 border-line bg-surface">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-display text-4xl text-brand">My hissa</h1>
        {backings.length > 0 ? (
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              {backings.map((b) => (
                <span
                  key={b.stall.id}
                  className="grid size-11 place-items-center rounded-full border-4 border-background bg-gold-soft text-xl"
                >
                  {b.stall.vendorAvatar}
                </span>
              ))}
            </div>
            <p className="text-lg leading-snug">
              You&apos;re part of <b>{backings.length} {backings.length === 1 ? "stall's" : "stalls'"}</b> story
            </p>
          </div>
        ) : (
          <p className="text-lg">
            You haven&apos;t backed a stall yet.{" "}
            <Link href="/back" className="font-semibold text-brand">
              Find one to support →
            </Link>
          </p>
        )}
      </header>
      <div className="bunting" />

      {viewer.playMoney != null && (
        <section className="flex items-center justify-between rounded-2xl border-2 border-line bg-surface p-4">
          <div>
            <p className="text-sm text-muted">Play money to back stalls</p>
            <p className="font-display text-2xl">{formatINR(viewer.playMoney)}</p>
          </div>
          <span className="text-3xl">🪙</span>
        </section>
      )}

      {/* Food credit */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-xl">Treats waiting for you</h2>
          <span className="text-sm font-semibold text-brand">{formatINR(totalCredit)}</span>
        </div>
        <p className="text-sm text-muted">Food credit from milestones. Spend it at the stall that gave it to you.</p>
        {Object.entries(credits)
          .filter(([id, amount]) => amount > 0 && stallById.has(id))
          .map(([id, amount]) => {
            const stall = stallById.get(id)!;
            return (
              <div key={id} className="flex items-center gap-3 rounded-2xl border-2 border-gold bg-gold-soft/50 p-3">
                <StallPhoto stall={stall} className="size-12 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{stall.name}</p>
                  <p className="text-sm font-semibold text-brand">{formatINR(amount)} of treats</p>
                </div>
                <button
                  onClick={() => setSheet({ kind: "redeem", stallId: id })}
                  className="rounded-xl bg-brand px-4 py-2 font-semibold text-white"
                >
                  Redeem
                </button>
              </div>
            );
          })}
        {totalCredit === 0 && (
          <p className="rounded-2xl border-2 border-dashed border-line p-4 text-center text-sm text-muted">
            No treats to redeem yet. You get food credit when a stall you backed hits a milestone. The first one is
            reaching its funding goal.
          </p>
        )}
      </section>

      {/* Cash share of growth: present, but calm */}
      <section className="space-y-3 rounded-3xl border-2 border-line border-l-8 border-l-grow bg-surface p-5">
        <h2 className="font-display text-xl">Your share of their growth</h2>
        <p className="text-sm text-muted">
          As the stalls you backed sell more, a part comes back to you. {formatINR(totalEarned)} so far.
        </p>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted">Ready to withdraw</p>
            <p className="text-3xl font-bold text-grow">{formatINR(withdrawable)}</p>
          </div>
          <button
            disabled={withdrawable < MIN_WITHDRAWAL}
            onClick={() => setSheet({ kind: "withdraw" })}
            className="rounded-xl border-2 border-grow px-4 py-2 font-semibold text-grow disabled:opacity-50"
          >
            {withdrawable < MIN_WITHDRAWAL ? `From ${formatINR(MIN_WITHDRAWAL)}` : "Withdraw to UPI"}
          </button>
        </div>
        {mode === "live" && (
          <button
            onClick={simulate}
            disabled={simulating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-grow-soft py-2.5 font-semibold text-grow disabled:opacity-60"
          >
            <FastForward className="size-4" />
            {simulating ? "Fast-forwarding…" : "Simulate a month of sales"}
          </button>
        )}
        {notice && <p className="text-sm">{notice}</p>}
      </section>

      {/* Money backed */}
      {backings.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-xl">Stalls you&apos;re growing with</h2>
          {backings.map((b) => {
            const funded = b.campaign.raised >= b.campaign.goal;
            const released = b.campaign.milestones
              .filter((m) => m.status === "done")
              .reduce((sum, m) => sum + m.releasePct, 0);
            const cap = Math.round(b.amount * b.campaign.revenueShare.cap);
            const status = !funded
              ? { tone: "text-muted", text: "Gathering neighbours · fully refunded if the goal isn't met" }
              : released < 100
                ? { tone: "text-brand", text: `Being built · ${released}% released so far, the rest is held safely` }
                : { tone: "text-grow", text: "Growing · sharing sales growth with you monthly" };
            return (
              <Link
                key={b.campaignId}
                href={`/stalls/${b.stall.id}#campaign`}
                className="block space-y-2 rounded-2xl border-2 border-line bg-surface p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{b.stall.vendorAvatar}</span>
                  <p className="min-w-0 flex-1 truncate font-semibold">
                    {firstName(b.stall)}&apos;s {b.campaign.shortGoal.replace(/^(a|an) /, "")}
                  </p>
                  <p className="shrink-0 text-sm text-muted">{formatINR(b.amount)}</p>
                </div>
                <p className={`text-xs ${status.tone}`}>{status.text}</p>
                <ProgressBar value={percent(b.earned, cap)} tone="grow" />
                <p className="text-xs text-muted">
                  {formatINR(b.earned)} of {formatINR(cap)} paid back ({b.campaign.revenueShare.cap}× cap)
                </p>
              </Link>
            );
          })}
          <div className="rounded-2xl bg-background p-4 text-xs text-muted">
            <p className="mb-1 font-semibold text-ink">Can I take my money out early?</p>
            Your backing comes back through monthly revenue share until the cap is reached. If a campaign misses its
            goal you&apos;re refunded in full, and if a stall closes, any money still in escrow is returned pro-rata.
            <button disabled className="mt-3 w-full rounded-xl border border-line py-2 font-medium text-muted">
              Sell your hissa to another backer · coming soon
            </button>
          </div>
        </section>
      )}

      {/* History */}
      <section className="space-y-2 pb-4">
        <h2 className="font-display text-xl">History</h2>
        <ul className="divide-y divide-line rounded-2xl border-2 border-line bg-surface">
          {history.map((t, i) => (
            <li key={`${t.date}-${i}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate">{t.label}</p>
                <p className="text-xs text-muted">{t.date}</p>
              </div>
              <span
                className={`shrink-0 font-semibold ${
                  t.kind === "earning" || t.kind === "credit" || t.kind === "topup" ? "text-grow" : "text-muted"
                }`}
              >
                {t.amount > 0 ? "+" : "−"}
                {formatINR(Math.abs(t.amount))}
                {(t.kind === "credit" || t.kind === "redeemed") && <span className="text-xs font-normal"> credit</span>}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {sheet?.kind === "withdraw" && (
        <WithdrawSheet max={withdrawable} mode={mode} onClose={() => setSheet(null)} submit={withdraw} />
      )}
      {sheet?.kind === "redeem" && stallById.has(sheet.stallId) && (
        <RedeemSheet
          stall={stallById.get(sheet.stallId)!}
          available={credits[sheet.stallId] ?? 0}
          mode={mode}
          onClose={() => setSheet(null)}
          submit={redeem}
        />
      )}
    </main>
  );
}

function WithdrawSheet({
  max,
  mode,
  onClose,
  submit,
}: {
  max: number;
  mode: Mode;
  onClose: () => void;
  submit: (amount: number, upi: string) => Promise<string | null>;
}) {
  const [amount, setAmount] = useState(max);
  const [upi, setUpi] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const validUpi = /^[\w.-]{2,}@[a-z]{2,}$/i.test(upi.trim());
  const validAmount = amount >= MIN_WITHDRAWAL && amount <= max;

  return (
    <BottomSheet onClose={onClose}>
      {done ? (
        <div className="space-y-3 py-4 text-center">
          <p className="text-5xl">💸</p>
          <h3 className="font-display text-2xl">{formatINR(amount)} is on its way</h3>
          <p className="text-sm text-muted">To {upi.trim()}. Usually arrives within a few minutes.</p>
          <p className="text-xs text-muted">{mode === "live" ? "Play money: no real money moves." : "Demo: nothing is saved."}</p>
          <button onClick={onClose} className="w-full rounded-xl bg-brand py-3 font-semibold text-white">
            Done
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-display text-xl">Withdraw to UPI</h3>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted">UPI ID</span>
            <input value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="yourname@okaxis" className="input" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted">
              Amount (min {formatINR(MIN_WITHDRAWAL)}, max {formatINR(max)})
            </span>
            <input
              type="number"
              value={amount}
              min={MIN_WITHDRAWAL}
              max={max}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="input"
            />
          </label>
          {error && <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand">{error}</p>}
          <button
            disabled={!validUpi || !validAmount || pending}
            onClick={() =>
              startTransition(async () => {
                const err = await submit(amount, upi.trim());
                if (err) setError(err);
                else setDone(true);
              })
            }
            className="w-full rounded-xl bg-brand py-3 font-semibold text-white disabled:bg-line disabled:text-muted"
          >
            {pending ? "Sending…" : `Withdraw ${validAmount ? formatINR(amount) : ""}`}
          </button>
        </div>
      )}
    </BottomSheet>
  );
}

function RedeemSheet({
  stall,
  available,
  mode,
  onClose,
  submit,
}: {
  stall: Stall;
  available: number;
  mode: Mode;
  onClose: () => void;
  submit: (stall: Stall, amount: number) => Promise<{ code?: string; error?: string }>;
}) {
  const options = [...new Set([50, 100, available].filter((v) => v <= available))];
  const [amount, setAmount] = useState(options[options.length - 1]);
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const who = stall.vendorName || "the vendor";
  // In live mode someone has to run the stall on Hissa to accept the code.
  const noVendor = mode === "live" && !stall.hasOwner;

  return (
    <BottomSheet onClose={onClose}>
      {code ? (
        <div className="space-y-3 py-2 text-center">
          <p className="text-4xl">{stall.vendorAvatar}</p>
          <p className="text-sm text-muted">Show this to {who} at the counter</p>
          <p className="font-mono text-5xl font-bold tracking-[0.3em] text-brand">{code}</p>
          <p className="text-lg font-semibold">
            {formatINR(amount)} off at {stall.name}
          </p>
          <p className="text-xs text-muted">
            Valid for 15 minutes{mode === "live" ? ". Your credit is used once they accept it." : ""}
          </p>
          <button onClick={onClose} className="w-full rounded-xl bg-brand py-3 font-semibold text-white">
            Done
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="font-display text-xl">Treat yourself at {stall.name}</h3>
            <p className="text-sm text-muted">{formatINR(available)} of treats available</p>
          </div>
          <div className="flex gap-2">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => setAmount(o)}
                className={`flex-1 rounded-xl border-2 py-2 text-sm font-semibold ${
                  amount === o ? "border-brand bg-brand text-white" : "border-line"
                }`}
              >
                {o === available ? `All · ${formatINR(o)}` : formatINR(o)}
              </button>
            ))}
          </div>
          {noVendor && (
            <p className="rounded-xl bg-gold-soft p-3 text-sm">
              {stall.name} hasn&apos;t joined Hissa as a vendor yet, so there&apos;s nobody to accept a code. Your treats
              will be waiting when they do.
            </p>
          )}
          {error && <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand">{error}</p>}
          <button
            disabled={pending || noVendor}
            onClick={() =>
              startTransition(async () => {
                const result = await submit(stall, amount);
                if (result.code) setCode(result.code);
                else setError(result.error ?? "Couldn't redeem right now.");
              })
            }
            className="w-full rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Getting code…" : "Get redeem code"}
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
