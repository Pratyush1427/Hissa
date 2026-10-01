"use client";

import { Camera, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { suggestStall } from "@/app/actions";
import { AREAS } from "@/lib/areas";
import type { SnapResult } from "@/lib/ai/snap";
import type { Mode } from "@/lib/mode";

type Step = "capture" | "analyzing" | "review" | "problem" | "submitted";
type Prefill = { spotId: string; name: string; area: string; lat?: number; lng?: number };
type Listing = {
  name: string;
  area: string;
  tags: string;
  veg: boolean;
  dishes: SnapResult["dishes"];
};

// Claude reads images best at up to ~1568px on the long edge; larger only adds upload time.
const MAX_EDGE = 1568;

async function shrinkPhoto(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    return blob ?? file;
  } catch {
    // Formats the browser can't decode (e.g. some HEIC) go up as-is; the server validates them.
    return file;
  }
}

export default function SuggestFlow({
  prefill,
  mode,
  signedIn,
}: {
  prefill?: Prefill;
  mode: Mode;
  signedIn: boolean;
}) {
  const [step, setStep] = useState<Step>("capture");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [submitting, startSubmitting] = useTransition();
  const [photo, setPhoto] = useState<string | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [banner, setBanner] = useState<{ demo: boolean; text: string } | null>(null);
  const [problem, setProblem] = useState("");
  const areaOptions = prefill && !AREAS.includes(prefill.area as (typeof AREAS)[number]) ? [prefill.area, ...AREAS] : AREAS;

  useEffect(() => {
    return () => {
      if (photo) URL.revokeObjectURL(photo);
    };
  }, [photo]);

  async function onPhoto(file: File | undefined) {
    if (!file) return;
    setPhoto(URL.createObjectURL(file));
    setStep("analyzing");

    const body = new FormData();
    body.append("photo", await shrinkPhoto(file), "photo.jpg");
    if (prefill) {
      body.append("name", prefill.name);
      body.append("area", prefill.area);
    }

    try {
      const res = await fetch("/api/snap", { method: "POST", body });
      const data: { mode?: "live" | "demo"; result?: SnapResult; error?: string } = await res.json();
      if (!res.ok || !data.result) throw new Error(data.error ?? "Something went wrong reading the photo.");

      const r = data.result;
      if (!r.isFoodStall) {
        setProblem(r.note || "This doesn't look like a food stall or menu. Try another photo.");
        setStep("problem");
        return;
      }
      setListing({
        name: r.name ?? prefill?.name ?? "",
        area: prefill?.area ?? "",
        tags: r.cuisineTags.join(", "),
        veg: r.veg ?? false,
        dishes: r.dishes,
      });
      setBanner({
        demo: data.mode === "demo",
        text: data.mode === "demo" ? r.note : `${r.languages.length ? `Read ${r.languages.join(" + ")}. ` : ""}${r.note}`,
      });
      setStep("review");
    } catch (err) {
      setProblem(err instanceof Error ? err.message : "Something went wrong reading the photo.");
      setStep("problem");
    }
  }

  function reset() {
    setPhoto(null);
    setListing(null);
    setBanner(null);
    setCreatedId(null);
    setSubmitError("");
    setStep("capture");
  }

  function submit(l: Listing) {
    if (mode === "demo") {
      setStep("submitted");
      return;
    }
    startSubmitting(async () => {
      const result = await suggestStall({
        name: l.name,
        area: l.area,
        tags: l.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        veg: l.veg,
        dishes: l.dishes,
        osmId: prefill?.spotId,
        lat: prefill?.lat,
        lng: prefill?.lng,
      });
      if (result.ok) {
        setCreatedId(result.data);
        setStep("submitted");
      } else {
        setSubmitError(result.error);
      }
    });
  }

  if (mode === "live" && !signedIn) {
    const back = prefill ? `/suggest?${new URLSearchParams({ spot: prefill.spotId, name: prefill.name, area: prefill.area })}` : "/suggest";
    return (
      <main className="flex-1 space-y-5 px-4 pt-6 md:mx-auto md:w-full md:max-w-2xl md:px-6">
        <h1 className="font-display text-3xl leading-tight text-brand">Found a great stall?</h1>
        <p className="text-muted">Sign in to add it to Hissa. Once 3 critics vouch, it goes live with your name on it.</p>
        <Link
          href={`/login?next=${encodeURIComponent(back)}`}
          className="block rounded-2xl bg-brand py-3.5 text-center text-lg font-semibold text-white"
        >
          Sign in to suggest
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 space-y-5 px-4 pt-6 md:mx-auto md:w-full md:max-w-2xl md:px-6">
      <header>
        <h1 className="font-display text-3xl leading-tight text-brand">
          {prefill ? `Be the first critic of ${prefill.name}` : "Suggest a stall"}
        </h1>
        <p className="mt-1 text-muted">
          {prefill
            ? "Add a photo of the stall or its menu board. AI reads the dishes and prices, and other critics vouch to bring it into Hissa."
            : "Snap the stall or its menu board. AI fills in the details, and other critics vouch to bring it live."}
        </p>
      </header>

      {step === "capture" && (
        <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-gold bg-gold-soft/50 text-brand">
          <span className="grid size-16 place-items-center rounded-full bg-brand text-white">
            <Camera className="size-8" />
          </span>
          <span className="text-lg font-semibold">Take or upload a photo</span>
          <span className="text-sm text-muted">Menu boards work best, even handwritten Kannada ones</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => onPhoto(e.target.files?.[0])}
          />
        </label>
      )}

      {photo && (step === "analyzing" || step === "review" || step === "problem") && (
        // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
        <img src={photo} alt="Your stall photo" className="max-h-56 w-full rounded-3xl border-2 border-line object-cover" />
      )}

      {step === "analyzing" && (
        <div className="flex items-center gap-3 rounded-2xl border-2 border-line bg-surface p-4">
          <span className="size-5 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          <p>Reading the board: dishes, prices, and any Kannada or Hindi…</p>
        </div>
      )}

      {step === "problem" && (
        <div className="space-y-3 rounded-2xl border-2 border-brand/40 bg-brand-soft p-4">
          <p>{problem}</p>
          <button onClick={reset} className="w-full rounded-xl bg-brand py-3 font-semibold text-white">
            Try another photo
          </button>
        </div>
      )}

      {step === "review" && listing && (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            submit(listing);
          }}
        >
          {banner && (
            <p
              className={`rounded-xl p-3 text-sm ${banner.demo ? "bg-gold-soft text-ink" : "bg-grow-soft text-grow"}`}
            >
              {banner.demo ? "🧪 " : "✨ Filled in by AI. "}
              {banner.text}
            </p>
          )}
          <Field label="Stall name">
            <input
              required
              value={listing.name}
              onChange={(e) => setListing({ ...listing, name: e.target.value })}
              placeholder="What's it called?"
              className="input"
            />
          </Field>
          <Field label="Area">
            <select
              required
              value={listing.area}
              onChange={(e) => setListing({ ...listing, area: e.target.value })}
              className="input"
            >
              <option value="" disabled>
                Choose the area
              </option>
              {areaOptions.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
          <Field label="Tags">
            <input
              value={listing.tags}
              onChange={(e) => setListing({ ...listing, tags: e.target.value })}
              className="input"
            />
          </Field>
          <Field label={`Dishes found on the board · ${listing.dishes.length}`}>
            {listing.dishes.length === 0 ? (
              <p className="rounded-xl border-2 border-dashed border-line p-3 text-sm text-muted">
                No dishes were readable. Critics can add them later.
              </p>
            ) : (
              <ul className="rounded-xl border-2 border-dashed border-line bg-surface px-3 py-1">
                {listing.dishes.map((d, i) => (
                  <li key={`${d.name}-${i}`} className="flex items-baseline gap-2 py-2">
                    <span>
                      {d.name}
                      {d.original && <span className="ml-1 text-sm text-muted">· {d.original}</span>}
                    </span>
                    <span className="flex-1 border-b-2 border-dotted border-line" />
                    <span className="font-semibold">{d.price != null ? `₹${d.price}` : "—"}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${d.name}`}
                      onClick={() => setListing({ ...listing, dishes: listing.dishes.filter((_, j) => j !== i) })}
                      className="self-center text-muted"
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Field>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={listing.veg}
              onChange={(e) => setListing({ ...listing, veg: e.target.checked })}
              className="size-4 accent-[var(--grow)]"
            />
            Pure veg
          </label>
          {submitError && <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand">{submitError}</p>}
          <button
            disabled={submitting}
            className="w-full rounded-2xl bg-brand py-3.5 text-lg font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit for vouching"}
          </button>
        </form>
      )}

      {step === "submitted" && listing && (
        <div className="space-y-3 rounded-3xl border-2 border-line bg-surface p-6 text-center">
          <p className="text-5xl">🔍</p>
          <h2 className="font-display text-2xl">{listing.name} submitted!</h2>
          <p className="text-muted">
            {mode === "live"
              ? "It's on Hissa now as a new find. Once 3 critics vouch for it, it goes live with your name on it."
              : "Demo: nothing is saved. In Live mode, 3 vouches bring it onto Hissa with your name on it."}
          </p>
          {createdId && (
            <Link
              href={`/stalls/${createdId}`}
              className="block w-full rounded-xl bg-brand py-3 font-semibold text-white"
            >
              See your find
            </Link>
          )}
          <button onClick={reset} className="w-full rounded-xl border-2 border-brand py-3 font-semibold text-brand">
            Suggest another
          </button>
        </div>
      )}
    </main>
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
