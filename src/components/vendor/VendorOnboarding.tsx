"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { claimStall, registerStall } from "@/app/actions";
import { AREA_CENTRES, AREAS } from "@/lib/areas";
import type { Area, Stall } from "@/lib/types";
import StallPhoto from "../StallPhoto";

const AVATARS = ["🧑🏽‍🍳", "👨🏽‍🍳", "👩🏽‍🍳", "👨🏾‍🍳", "👩🏻‍🍳", "🧔🏽", "👵🏽", "👴🏽"];

export default function VendorOnboarding({ claimable, preselect }: { claimable: Stall[]; preselect?: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<"claim" | "register">(claimable.length && preselect !== "new" ? "claim" : "register");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | undefined>(
    claimable.some((s) => s.id === preselect) ? preselect : undefined,
  );
  const [vendorName, setVendorName] = useState("");
  const [quote, setQuote] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return claimable.filter((s) => !q || s.name.toLowerCase().includes(q) || String(s.area).toLowerCase().includes(q));
  }, [claimable, query]);

  function done(result: { ok: boolean; error?: string }) {
    if (result.ok) router.refresh();
    else setError(result.error ?? "Something went wrong.");
  }

  function claim() {
    if (!selected) return;
    setError("");
    startTransition(async () => done(await claimStall(selected, { vendorName, quote, avatar })));
  }

  function register(form: FormData) {
    setError("");
    const area = String(form.get("area"));
    const centre = AREA_CENTRES[area as Area];
    startTransition(async () => {
      done(
        await registerStall({
          name: String(form.get("name") ?? ""),
          area,
          vendorName,
          quote,
          avatar,
          tags: String(form.get("tags") ?? "")
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          veg: form.get("veg") === "on",
          timings: String(form.get("timings") ?? ""),
          avgPrice: Number(form.get("avgPrice") ?? 0),
          dishes: [],
          lat: centre?.[0],
          lng: centre?.[1],
        }),
      );
    });
  }

  const aboutYou = (
    <div className="space-y-3 rounded-2xl bg-background p-4">
      <p className="font-semibold">About you (customers see this)</p>
      <div className="flex flex-wrap gap-2">
        {AVATARS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAvatar(a)}
            aria-pressed={avatar === a}
            className={`grid size-11 place-items-center rounded-full text-2xl ${
              avatar === a ? "bg-gold ring-2 ring-brand" : "bg-gold-soft"
            }`}
          >
            {a}
          </button>
        ))}
      </div>
      <input
        value={vendorName}
        onChange={(e) => setVendorName(e.target.value)}
        required
        maxLength={40}
        placeholder="Your name, e.g. Manjunath"
        className="input"
      />
      <input
        value={quote}
        onChange={(e) => setQuote(e.target.value)}
        maxLength={160}
        placeholder="A line about your food, e.g. Butter is not optional."
        className="input"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 rounded-2xl border-2 border-line bg-surface p-1 font-semibold">
        {(
          [
            ["claim", "My stall is on Hissa"],
            ["register", "Add my stall"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-xl py-2 ${tab === key ? "bg-brand text-white" : "text-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "claim" ? (
        <div className="space-y-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your stall's name or area"
            className="input"
          />
          {matches.length === 0 && (
            <p className="rounded-2xl border-2 border-dashed border-line p-4 text-center text-muted">
              Can&apos;t find it? Use <b>Add my stall</b> instead.
            </p>
          )}
          <ul className="max-h-80 space-y-2 overflow-y-auto">
            {matches.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => setSelected(s.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border-2 bg-surface p-3 text-left ${
                    selected === s.id ? "border-brand" : "border-line"
                  }`}
                >
                  <StallPhoto stall={s} className="size-12 shrink-0 rounded-xl" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{s.name}</span>
                    <span className="text-sm text-muted">{s.area}</span>
                  </span>
                  {selected === s.id && <span className="text-brand">✓</span>}
                </button>
              </li>
            ))}
          </ul>
          {selected && (
            <>
              {aboutYou}
              {error && <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand">{error}</p>}
              <button
                onClick={claim}
                disabled={pending || vendorName.trim().length < 2}
                className="w-full rounded-2xl bg-brand py-3.5 text-lg font-semibold text-white disabled:opacity-50"
              >
                {pending ? "Claiming…" : "This is my stall"}
              </button>
              <p className="text-center text-xs text-muted">
                Play mode: claims are approved instantly. A real launch would verify in person.
              </p>
            </>
          )}
        </div>
      ) : (
        <form action={register} className="space-y-3">
          <input name="name" required minLength={2} maxLength={80} placeholder="Stall name" className="input" />
          <select name="area" required defaultValue="" className="input">
            <option value="" disabled>
              Which area?
            </option>
            {AREAS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
          <input name="tags" placeholder="What you serve, e.g. Dosa, Breakfast" className="input" />
          <div className="grid grid-cols-2 gap-3">
            <input name="timings" maxLength={40} placeholder="Hours, e.g. 7 AM – 11 AM" className="input" />
            <input name="avgPrice" type="number" min={0} max={2000} placeholder="Avg price ₹" className="input" />
          </div>
          <label className="flex items-center gap-2">
            <input name="veg" type="checkbox" className="size-4 accent-[var(--grow)]" /> Pure veg
          </label>
          {aboutYou}
          {error && <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand">{error}</p>}
          <button
            disabled={pending || vendorName.trim().length < 2}
            className="w-full rounded-2xl bg-brand py-3.5 text-lg font-semibold text-white disabled:opacity-50"
          >
            {pending ? "Adding your stall…" : "Add my stall to Hissa"}
          </button>
        </form>
      )}
    </div>
  );
}
