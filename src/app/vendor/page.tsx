import { ExternalLink } from "lucide-react";
import Link from "next/link";
import MilestoneList from "@/components/MilestoneList";
import ModeSwitch from "@/components/ModeSwitch";
import ProgressBar from "@/components/ProgressBar";
import PostUpdateForm from "@/components/vendor/PostUpdateForm";
import RedeemCodeBox from "@/components/vendor/RedeemCodeBox";
import VendorOnboarding from "@/components/vendor/VendorOnboarding";
import { getData } from "@/lib/data";
import { formatINR, overallRating, percent } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function VendorPage({ searchParams }: PageProps<"/vendor">) {
  const { claim } = await searchParams;
  const data = await getData();
  const [viewer, vendor] = await Promise.all([data.getViewer(), data.getVendor()]);

  const header = (
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">For vendors</p>
      {isSupabaseConfigured() && <ModeSwitch mode={data.mode} />}
    </div>
  );

  if (!viewer) {
    return (
      <main className="flex-1 space-y-5 px-4 pt-6 md:mx-auto md:w-full md:max-w-2xl md:px-6">
        {header}
        <h1 className="font-display text-4xl text-brand">Run a stall?</h1>
        <p className="text-lg">
          Bring your stall onto Hissa. Let your regulars back your next step, share updates, and welcome them with treats.
        </p>
        <ul className="space-y-2 text-muted">
          <li>🤝 Raise money from neighbours for a new tawa, cart or shop</li>
          <li>🌱 Pay back only from <b>extra</b> sales, never more than the cap</li>
          <li>🎁 Accept treat codes at the counter in one tap</li>
        </ul>
        <Link href="/login?next=/vendor" className="block rounded-2xl bg-brand py-3.5 text-center text-lg font-semibold text-white">
          Sign up or sign in
        </Link>
      </main>
    );
  }

  if (!vendor) {
    const stalls = await data.listStalls();
    const claimable = stalls.filter((s) => !s.hasOwner);
    return (
      <main className="flex-1 space-y-5 px-4 pt-6 md:mx-auto md:w-full md:max-w-2xl md:px-6">
        {header}
        <h1 className="font-display text-4xl text-brand">Bring your stall onto Hissa</h1>
        <p className="text-lg">Claim your stall if critics already found it, or add it yourself.</p>
        <div className="bunting" />
        <VendorOnboarding claimable={claimable} preselect={typeof claim === "string" ? claim : undefined} />
      </main>
    );
  }

  const { stall, campaign, backers, redemptions } = vendor;
  const active = campaign && campaign.raised < campaign.goal && campaign.endsInDays > 0;
  const rating = overallRating(stall.ratings);
  const firstName = (stall.vendorName || stall.name).split(" ")[0];

  return (
    <main className="flex-1 space-y-6 px-4 pt-6 md:px-6">
      {header}
      <section className="flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-full border-4 border-gold bg-gold-soft text-4xl">
          {stall.vendorAvatar}
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-3xl leading-tight text-brand">Namaskara, {firstName}!</h1>
          <Link href={`/stalls/${stall.id}`} className="flex items-center gap-1 text-muted underline">
            {stall.name} <ExternalLink className="size-4" />
          </Link>
        </div>
      </section>
      {data.mode === "demo" && (
        <p className="rounded-xl bg-gold-soft p-3 text-sm">Demo: you&apos;re seeing Manjunath&apos;s dashboard. Nothing here is saved.</p>
      )}
      <div className="bunting" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <RedeemCodeBox mode={data.mode} />

          <section className="grid grid-cols-3 gap-2 text-center">
            <Stat value={rating ? `★ ${rating}` : "New"} label={`${stall.ratingCount} ratings`} />
            <Stat value={String(campaign?.backers ?? 0)} label="Backers" />
            <Stat value={formatINR(campaign?.raised ?? 0)} label="Raised" />
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-xl">Treats you&apos;ve served</h2>
            {redemptions.length === 0 ? (
              <p className="rounded-2xl border-2 border-dashed border-line p-4 text-center text-sm text-muted">
                No treat codes yet. Backers earn treats when you hit milestones.
              </p>
            ) : (
              <ul className="divide-y divide-line rounded-2xl border-2 border-line bg-surface">
                {redemptions.map((r, i) => (
                  <li key={i} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-2xl">{r.avatar}</span>
                    <span className="flex-1">{r.name}</span>
                    <span className="font-semibold">{formatINR(r.amount)}</span>
                    <span className="text-xs text-muted">{r.date}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          {campaign ? (
            <section className="space-y-4 rounded-3xl border-2 border-gold bg-gold-soft/40 p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand">
                    {active ? "Your campaign" : campaign.raised >= campaign.goal ? "Funded 🎉" : "Campaign closed"}
                  </p>
                  <h2 className="font-display text-2xl leading-snug">Get {campaign.shortGoal}</h2>
                </div>
                <Link href={`/stalls/${stall.id}#campaign`} className="shrink-0 text-sm font-semibold text-brand">
                  View →
                </Link>
              </div>
              <ProgressBar value={percent(campaign.raised, campaign.goal)} />
              <p className="text-sm text-muted">
                {formatINR(campaign.raised)} of {formatINR(campaign.goal)} · {campaign.backers} backers
                {active && ` · ${campaign.endsInDays} days left`}
              </p>
              <div className="rounded-2xl bg-surface p-4">
                <MilestoneList milestones={campaign.milestones} />
              </div>
              <div className="rounded-2xl bg-surface p-4">
                <PostUpdateForm mode={data.mode} />
              </div>
            </section>
          ) : null}

          {!active && (
            <Link
              href="/vendor/campaign/new"
              className="block rounded-3xl border-2 border-dashed border-gold bg-gold-soft/50 p-5 text-center"
            >
              <p className="font-display text-xl">Start a growth campaign</p>
              <p className="text-muted">Raise money from your regulars for your next step.</p>
            </Link>
          )}

          <section className="space-y-2">
            <h2 className="font-display text-xl">Your backers</h2>
            {backers.length === 0 ? (
              <p className="rounded-2xl border-2 border-dashed border-line p-4 text-center text-sm text-muted">
                {campaign ? "No player backers yet. Share your stall page with your regulars!" : "Start a campaign to get backers."}
              </p>
            ) : (
              <ul className="divide-y divide-line rounded-2xl border-2 border-line bg-surface">
                {backers.map((b) => (
                  <li key={b.handle} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-2xl">{b.avatar}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{b.name}</span>
                      <span className="text-xs text-muted">@{b.handle}</span>
                    </span>
                    <span className="font-semibold">{formatINR(b.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border-2 border-line bg-surface py-3">
      <p className="font-display text-xl text-brand">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
