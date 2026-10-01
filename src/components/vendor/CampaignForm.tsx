"use client";

import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createCampaign } from "@/app/actions";
import { formatINR } from "@/lib/format";
import type { Mode } from "@/lib/mode";
import type { Stall } from "@/lib/types";

type CostRow = { item: string; amount: string };

const DURATIONS = [14, 21, 30, 45];

export default function CampaignForm({ stall, mode }: { stall: Stall; mode: Mode }) {
  const router = useRouter();
  const firstName = (stall.vendorName || stall.name).split(" ")[0];
  const [shortGoal, setShortGoal] = useState("");
  const [story, setStory] = useState("");
  const [costs, setCosts] = useState<CostRow[]>([{ item: "", amount: "" }]);
  const [days, setDays] = useState(21);
  const [pct, setPct] = useState(8);
  const [cap, setCap] = useState(1.5);
  const [baseline, setBaseline] = useState("");
  const [error, setError] = useState("");
  const [demoDone, setDemoDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const cleanCosts = costs
    .map((c) => ({ item: c.item.trim(), amount: Number(c.amount) }))
    .filter((c) => c.item && c.amount > 0);
  const goal = cleanCosts.reduce((s, c) => s + c.amount, 0);
  const monthly = Number(baseline) || 0;
  // What a ₹1,000 backer would get each month if sales grew 25%.
  const perThousand = goal ? Math.round(monthly * 0.25 * (pct / 100) * (1000 / goal)) : 0;
  const valid = shortGoal.trim().length >= 3 && goal >= 5000 && goal <= 500000 && monthly > 0;

  function submit() {
    setError("");
    if (mode === "demo") {
      setDemoDone(true);
      return;
    }
    startTransition(async () => {
      const result = await createCampaign({
        shortGoal,
        story,
        goal,
        days,
        costBreakdown: cleanCosts,
        pctOfGrowth: pct,
        cap,
        baselineMonthly: monthly,
      });
      if (result.ok) {
        router.push(`/stalls/${stall.id}#campaign`);
      } else {
        setError(result.error);
      }
    });
  }

  if (demoDone) {
    return (
      <div className="space-y-3 rounded-3xl border-2 border-line bg-surface p-6 text-center">
        <p className="text-5xl">🎉</p>
        <h2 className="font-display text-2xl">Campaign ready!</h2>
        <p className="text-muted">Demo: nothing is saved. In Live mode it goes up on your stall page right away.</p>
        <Link href="/vendor" className="block rounded-2xl bg-brand py-3 font-semibold text-white">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Field label={`What do you need? "Help ${firstName} get…"`}>
        <input
          value={shortGoal}
          onChange={(e) => setShortGoal(e.target.value)}
          maxLength={60}
          placeholder="a second tawa"
          className="input"
        />
      </Field>

      <Field label="Your story: why this matters">
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          maxLength={600}
          rows={4}
          placeholder="On weekends people wait 20 minutes and some leave. A second tawa means nobody goes home hungry."
          className="input"
        />
      </Field>

      <Field label="Where the money goes">
        <div className="space-y-2">
          {costs.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={c.item}
                onChange={(e) => setCosts(costs.map((x, j) => (j === i ? { ...x, item: e.target.value } : x)))}
                placeholder="e.g. Cast-iron tawa"
                className="input"
              />
              <input
                value={c.amount}
                onChange={(e) => setCosts(costs.map((x, j) => (j === i ? { ...x, amount: e.target.value } : x)))}
                type="number"
                min={0}
                placeholder="₹"
                className="input w-32"
              />
              {costs.length > 1 && (
                <button
                  type="button"
                  aria-label="Remove item"
                  onClick={() => setCosts(costs.filter((_, j) => j !== i))}
                  className="text-muted"
                >
                  <X className="size-5" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setCosts([...costs, { item: "", amount: "" }])}
            className="flex items-center gap-1 text-sm font-semibold text-brand"
          >
            <Plus className="size-4" /> Add item
          </button>
          <p className="text-sm">
            Goal: <b>{formatINR(goal)}</b>
            {goal > 0 && goal < 5000 && <span className="text-brand"> (minimum ₹5,000)</span>}
          </p>
        </div>
      </Field>

      <Field label="How long to raise it">
        <div className="flex gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`flex-1 rounded-xl border-2 py-2 font-semibold ${
                days === d ? "border-brand bg-brand text-white" : "border-line"
              }`}
            >
              {d} days
            </button>
          ))}
        </div>
      </Field>

      <div className="space-y-4 rounded-2xl bg-background p-4">
        <p className="font-semibold">What backers get back</p>
        <Field label="Your usual monthly sales (₹)">
          <input
            value={baseline}
            onChange={(e) => setBaseline(e.target.value)}
            type="number"
            min={0}
            placeholder="e.g. 150000"
            className="input"
          />
        </Field>
        <Field label={`Share of extra sales with backers: ${pct}%`}>
          <input
            type="range"
            min={1}
            max={30}
            value={pct}
            onChange={(e) => setPct(Number(e.target.value))}
            className="w-full accent-[var(--brand)]"
          />
        </Field>
        <Field label={`Stop paying once each backer gets back ${cap}× their money`}>
          <input
            type="range"
            min={1.1}
            max={2}
            step={0.1}
            value={cap}
            onChange={(e) => setCap(Number(e.target.value))}
            className="w-full accent-[var(--brand)]"
          />
        </Field>
        <p className="text-sm text-muted">
          You only share from <b>extra</b> sales above {monthly ? formatINR(monthly) : "your usual month"}. If sales
          don&apos;t grow, you owe nothing extra.
        </p>
      </div>

      {shortGoal && goal >= 5000 && (
        <div className="rounded-2xl border-2 border-gold bg-gold-soft/40 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">Preview</p>
          <p className="font-display text-xl">
            Help {firstName} get {shortGoal.trim()}
          </p>
          <p className="text-sm text-muted">
            {formatINR(goal)} in {days} days · A ₹1,000 backer gets about {formatINR(perThousand)}/month if sales grow
            25%, until they&apos;ve received {formatINR(1000 * cap)}.
          </p>
        </div>
      )}

      {error && <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand">{error}</p>}
      <button
        onClick={submit}
        disabled={!valid || pending}
        className="w-full rounded-2xl bg-brand py-3.5 text-lg font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Starting…" : "Start my campaign"}
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted">{label}</p>
      {children}
    </div>
  );
}
