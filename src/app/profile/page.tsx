import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { signOut } from "@/app/actions";
import ModeSwitch from "@/components/ModeSwitch";
import ProgressBar from "@/components/ProgressBar";
import { getData } from "@/lib/data";
import { formatINR, percent } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function ProfilePage() {
  const data = await getData();
  const [viewer, stalls] = await Promise.all([data.getViewer(), data.listStalls()]);

  if (!viewer) {
    return (
      <main className="flex-1 space-y-5 px-4 pt-8 md:mx-auto md:w-full md:max-w-2xl md:px-6">
        <div className="flex justify-end">
          <ModeSwitch mode={data.mode} />
        </div>
        <section className="space-y-3 rounded-3xl border-2 border-line bg-surface p-6 text-center">
          <p className="text-6xl">🧑🏽‍🍳</p>
          <h1 className="font-display text-3xl text-brand">Become a critic</h1>
          <p className="text-muted">
            Rate stalls, find hidden gems, and back the vendors you love with ₹10,000 of play money.
          </p>
          <Link href="/login" className="block rounded-2xl bg-brand py-3.5 text-lg font-semibold text-white">
            Sign up or sign in
          </Link>
          <p className="text-sm text-muted">Just looking? Switch to Demo to explore a sample profile.</p>
        </section>
      </main>
    );
  }

  const me = viewer.critic;
  const totalCredit = Object.values(viewer.credits).reduce((a, b) => a + b, 0);
  const suggested = stalls.filter((s) => s.suggestedBy === me.handle);
  const myStall = stalls.find((s) => s.ownedByViewer);

  return (
    <main className="flex-1 space-y-6 px-4 pt-6 md:mx-auto md:w-full md:max-w-2xl md:px-6">
      {isSupabaseConfigured() && (
        <div className="flex items-center justify-between">
          <ModeSwitch mode={data.mode} />
          {data.mode === "live" && (
            <form action={signOut}>
              <button className="text-sm font-semibold text-muted underline">Sign out</button>
            </form>
          )}
        </div>
      )}

      <section className="text-center">
        <span className="mx-auto grid size-24 place-items-center rounded-full border-4 border-gold bg-gold-soft text-6xl">
          {me.avatar}
        </span>
        <h1 className="mt-3 font-display text-3xl">{me.name}</h1>
        <p className="text-muted">
          @{me.handle} · {me.area}
        </p>
        <p className="mt-3 inline-block rounded-full bg-brand px-4 py-1.5 font-semibold text-white">✨ {me.persona}</p>
      </section>

      <section className="grid grid-cols-3 gap-2 text-center">
        <Stat value={String(me.tasteScore)} label="Taste score" />
        <Stat value={String(me.reviews)} label="Reviews" />
        <Stat value={String(me.followers)} label="Followers" />
      </section>

      <Link href="/wallet" className="flex items-center gap-3 rounded-2xl border-2 border-gold bg-gold-soft/60 p-4">
        <span className="text-3xl">🎁</span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg leading-tight">My hissa</p>
          <p className="text-sm text-muted">
            {formatINR(totalCredit)} treats to redeem · {formatINR(viewer.withdrawable)} to withdraw
          </p>
        </div>
        <span className="rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white">Redeem</span>
      </Link>
      <Link href="/vendor" className="flex items-center gap-3 rounded-2xl border-2 border-line bg-surface p-4">
        <span className="text-3xl">{myStall ? myStall.vendorAvatar : "🧑🏽‍🍳"}</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{myStall ? "Your stall dashboard" : "Run a stall?"}</p>
          <p className="truncate text-sm text-muted">
            {myStall ? myStall.name : "Bring it onto Hissa and let your regulars back you"}
          </p>
        </div>
        <ChevronRight className="size-5 text-brand" />
      </Link>
      <div className="bunting" />

      <section className="space-y-3">
        <Link href="/wallet" className="flex items-center justify-between">
          <h2 className="font-display text-xl">Stalls I&apos;m part of</h2>
          <span className="flex items-center text-sm font-semibold text-brand">
            My hissa <ChevronRight className="size-4" />
          </span>
        </Link>
        {viewer.playMoney != null && (
          <p className="text-sm text-muted">{formatINR(viewer.playMoney)} of play money left to back stalls</p>
        )}
        {viewer.backings.length === 0 && (
          <Link href="/back" className="block rounded-2xl border-2 border-dashed border-gold bg-gold-soft/50 p-4 text-center">
            You haven&apos;t backed a stall yet. <b className="text-brand">See who needs support →</b>
          </Link>
        )}
        {viewer.backings.map((b) => {
          const done = b.campaign.milestones.filter((m) => m.status === "done").length;
          return (
            <Link
              key={b.campaignId}
              href={`/stalls/${b.stall.id}#campaign`}
              className="flex items-center gap-3 rounded-2xl border-2 border-line bg-surface p-3"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gold-soft text-2xl">
                {b.stall.vendorAvatar}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate font-semibold leading-tight">
                  {(b.stall.vendorName || b.stall.name).split(" ")[0]} · {b.campaign.shortGoal}
                </p>
                <p className="text-sm text-muted">
                  {done} of {b.campaign.milestones.length} milestones
                </p>
                <ProgressBar value={percent(done, b.campaign.milestones.length)} tone="grow" />
              </div>
            </Link>
          );
        })}
      </section>

      {me.badges.length > 0 && (
        <section>
          <h2 className="mb-2 font-display text-xl">Badges</h2>
          <div className="flex flex-wrap gap-2">
            {me.badges.map((b) => (
              <span key={b.title} className="rounded-full border-2 border-line bg-surface px-3 py-1 font-medium">
                {b.emoji} {b.title}
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 font-display text-xl">Stalls I found</h2>
        {suggested.length === 0 ? (
          <Link href="/suggest" className="block rounded-2xl border-2 border-dashed border-line p-4 text-center text-muted">
            Know a stall nobody&apos;s heard of? <b className="text-brand">Suggest it →</b>
          </Link>
        ) : (
          <ul className="space-y-2">
            {suggested.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/stalls/${s.id}`}
                  className="flex items-center gap-3 rounded-2xl border-2 border-line bg-surface p-3"
                >
                  <span className="text-2xl">{s.vendorName ? s.vendorAvatar : s.emoji}</span>
                  <span className="flex-1 font-medium">{s.name}</span>
                  <span className="text-sm text-muted">
                    {s.status === "pending" ? `${s.vouches ?? 0} vouches` : "Live"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border-2 border-line bg-surface py-3">
      <p className="font-display text-2xl text-brand">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
