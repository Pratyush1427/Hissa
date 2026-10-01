import { ArrowLeft, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import BackSheet from "@/components/BackSheet";
import MilestoneList from "@/components/MilestoneList";
import Neighbours from "@/components/Neighbours";
import ProgressBar from "@/components/ProgressBar";
import RateSheet from "@/components/RateSheet";
import StallPhoto from "@/components/StallPhoto";
import VouchButton from "@/components/VouchButton";
import { getData } from "@/lib/data";
import { formatINR, overallRating, percent } from "@/lib/format";

export default async function StallPage({ params }: PageProps<"/stalls/[id]">) {
  const { id } = await params;
  const data = await getData();
  const [stall, viewer] = await Promise.all([data.getStall(id), data.getViewer()]);
  if (!stall) notFound();

  const campaign = stall.campaignId ? await data.getCampaign(stall.campaignId) : undefined;
  const firstName = (stall.vendorName || stall.name).split(" ")[0];
  const rating = overallRating(stall.ratings);
  const signedIn = Boolean(viewer);
  const ratingRows = [
    ["Taste", stall.ratings.taste],
    ["Hygiene", stall.ratings.hygiene],
    ["Value", stall.ratings.value],
    ["Vibe", stall.ratings.vibe],
  ] as const;

  return (
    <main className="flex-1">
      <div className="relative md:mx-6 md:mt-6 md:overflow-hidden md:rounded-3xl">
        <StallPhoto stall={stall} className="h-60 md:h-80" size="text-8xl" credit />
        <Link
          href="/"
          className="absolute left-4 top-4 grid size-10 place-items-center rounded-full bg-surface/95 shadow"
          aria-label="Back to discover"
        >
          <ArrowLeft className="size-5" />
        </Link>
      </div>

      <div className="space-y-6 px-4 pb-6 md:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-x-8 lg:gap-y-6 lg:space-y-0">
        {/* Vendor first */}
        <section className="relative -mt-10 rounded-3xl border-2 border-line bg-surface p-5 shadow-sm lg:col-start-1">
          <span className="absolute -top-8 left-5 grid size-16 place-items-center rounded-full border-4 border-surface bg-gold-soft text-4xl">
            {stall.vendorName ? stall.vendorAvatar : stall.emoji}
          </span>
          <div className="flex justify-end">
            <span
              className={`rounded-lg px-2 py-1 text-sm font-bold ${
                rating ? "bg-grow text-white" : "border border-dashed border-steel text-muted"
              }`}
            >
              {rating ? `★ ${rating} · ${stall.ratingCount}` : "Not rated yet"}
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl leading-tight">{stall.name}</h1>
          {stall.vendorName ? (
            <p className="text-muted">
              Meet <b className="text-ink">{stall.vendorName}</b>
              {stall.since && `, serving since ${stall.since}`}
            </p>
          ) : (
            <p className="text-muted">The vendor&apos;s story will appear here once they join Hissa.</p>
          )}
          {stall.vendorQuote && (
            <blockquote className="mt-3 border-l-4 border-gold pl-3 text-lg italic">&ldquo;{stall.vendorQuote}&rdquo;</blockquote>
          )}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
            <span className="flex items-center gap-1">
              <MapPin className="size-4" /> {stall.area}
            </span>
            {stall.timings && (
              <span className="flex items-center gap-1">
                <Clock className="size-4" /> {stall.timings}
              </span>
            )}
            <span>{stall.veg ? "Pure veg" : "Non-veg"}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            {stall.verified && (
              <span className="rounded-full bg-grow-soft px-2 py-1 text-grow">✓ Verified vendor</span>
            )}
            {stall.suggestedBy && (
              <span className="rounded-full bg-brand-soft px-2 py-1 text-brand">Found by @{stall.suggestedBy}</span>
            )}
          </div>
        </section>

        {data.mode === "live" && (stall.ownedByViewer || !stall.hasOwner) && (
          <Link
            href={stall.ownedByViewer ? "/vendor" : `/vendor?claim=${stall.id}`}
            className="flex items-center justify-between rounded-2xl border-2 border-dashed border-line bg-surface px-4 py-3 lg:col-start-1"
          >
            <span>{stall.ownedByViewer ? "🧑🏽‍🍳 This is your stall" : "Is this your stall? Bring it onto Hissa"}</span>
            <span className="font-semibold text-brand">{stall.ownedByViewer ? "Dashboard →" : "Claim it →"}</span>
          </Link>
        )}

        {stall.status === "pending" && (
          <div className="lg:col-start-1">
            <VouchButton stall={stall} mode={data.mode} signedIn={signedIn} />
          </div>
        )}

        {campaign && (
          <section
            id="campaign"
            className="scroll-mt-4 space-y-4 rounded-3xl border-2 border-gold bg-gold-soft/40 p-5 md:scroll-mt-24 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-6 lg:row-start-1"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand">
                {campaign.raised >= campaign.goal ? "Funded by neighbours" : "Be part of the story"}
              </p>
              <h2 className="font-display text-2xl leading-snug">
                Help {firstName} get {campaign.shortGoal}
              </h2>
            </div>
            <p className="leading-relaxed">&ldquo;{campaign.story}&rdquo;</p>
            <p className="text-sm text-muted">— {stall.vendorName}</p>

            <div className="space-y-2">
              <ProgressBar value={percent(campaign.raised, campaign.goal)} />
              <div className="flex items-center justify-between">
                <Neighbours count={campaign.backers} />
                <span className="text-sm text-muted">
                  {campaign.endsInDays > 0 ? `${campaign.endsInDays} days left` : "Closed"}
                </span>
              </div>
            </div>

            {campaign.updates.length > 0 && (
              <div className="space-y-2 rounded-2xl bg-surface p-4">
                <p className="text-sm font-semibold">Updates from {firstName}</p>
                {campaign.updates.map((u) => (
                  <div key={u.date} className="flex gap-2 text-sm">
                    <span>{u.emoji}</span>
                    <span>
                      {u.text} <span className="text-xs text-muted">· {u.date}</span>
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-2xl bg-surface p-4">
              <p className="mb-3 text-sm font-semibold">The journey</p>
              <MilestoneList milestones={campaign.milestones} />
            </div>

            <div className="rounded-2xl bg-surface p-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-grow">✨ Why neighbours believe in this</p>
              <p className="text-sm">{campaign.insight.summary}</p>
              <ul className="mt-2 space-y-0.5 text-sm">
                {campaign.insight.signals.map((s) => (
                  <li key={s} className="text-grow">✓ {s}</li>
                ))}
                {campaign.insight.risks.map((r) => (
                  <li key={r} className="text-muted">• Worth knowing: {r}</li>
                ))}
              </ul>
            </div>

            <details className="rounded-2xl bg-surface p-4 text-sm">
              <summary className="cursor-pointer font-semibold">How backing works</summary>
              <ul className="mt-3 space-y-2 text-muted">
                <li>
                  🎁 <b className="text-ink">Treats at every milestone.</b> Food credit to spend at {firstName}&apos;s stall.
                </li>
                <li>
                  🌱 <b className="text-ink">A share of the growth.</b> Neighbours share {campaign.revenueShare.pctOfGrowth}%
                  of extra sales, until each gets back {campaign.revenueShare.cap}× what they put in.
                </li>
                <li>
                  🔒 <b className="text-ink">Safe by design.</b> Money is held and released to {firstName} only as
                  milestones happen. Full refund if the goal isn&apos;t reached.
                </li>
              </ul>
              <p className="mt-3 font-semibold text-ink">Where the money goes</p>
              <ul className="mt-1 space-y-1">
                {campaign.costBreakdown.map((c) => (
                  <li key={c.item} className="flex justify-between text-muted">
                    <span>{c.item}</span>
                    <span>{formatINR(c.amount)}</span>
                  </li>
                ))}
                <li className="flex justify-between border-t border-line pt-1 font-semibold text-ink">
                  <span>Total</span>
                  <span>{formatINR(campaign.goal)}</span>
                </li>
              </ul>
            </details>

            <BackSheet
              campaign={campaign}
              stall={stall}
              mode={data.mode}
              signedIn={signedIn}
              playMoney={viewer?.playMoney ?? null}
            />
          </section>
        )}

        <section className="rounded-3xl border-2 border-line bg-surface p-5 lg:col-start-1">
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-brand">✨ What people say</p>
          {stall.aiSummary && <p className="leading-relaxed">{stall.aiSummary}</p>}
          <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
            {ratingRows.map(([label, value]) => (
              <div key={label}>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">{label}</span>
                  <span className="font-semibold">{value}</span>
                </div>
                <ProgressBar value={(value / 5) * 100} tone="grow" />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <RateSheet key={JSON.stringify(stall.viewerRating ?? null)} stall={stall} mode={data.mode} signedIn={signedIn} />
          </div>
        </section>

        {stall.dishes.length > 0 && (
        <section className="lg:col-start-1">
          <h2 className="mb-2 font-display text-xl">On the menu</h2>
          <ul className="rounded-3xl border-2 border-dashed border-line bg-surface px-5 py-2">
            {stall.dishes.map((d) => (
              <li key={d.name} className="flex items-baseline gap-2 py-2">
                <span>{d.name}</span>
                <span className="flex-1 border-b-2 border-dotted border-line" />
                <span className="font-semibold">{d.price != null ? formatINR(d.price) : "—"}</span>
              </li>
            ))}
          </ul>
        </section>
        )}

        {stall.reviews.length > 0 && (
        <section className="lg:col-start-1">
          <h2 className="mb-2 font-display text-xl">From the critics</h2>
          <ul className="space-y-3">
            {stall.reviews.map((r) => {
              const critic = r.author;
              return (
                <li key={r.userId + r.date} className="rounded-2xl border-2 border-line bg-surface p-4">
                  <div className="mb-1 flex items-center gap-2 text-sm">
                    <span className="text-2xl">{critic?.avatar}</span>
                    <div>
                      <p className="font-semibold leading-tight">{critic?.name}</p>
                      <p className="text-xs text-muted">{critic?.persona}</p>
                    </div>
                    <span className="ml-auto text-gold">{"★".repeat(r.rating)}</span>
                  </div>
                  <p>{r.text}</p>
                </li>
              );
            })}
          </ul>
        </section>
        )}
      </div>
    </main>
  );
}
