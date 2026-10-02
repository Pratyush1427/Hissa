import Link from "next/link";
import DiscoverView from "@/components/DiscoverView";
import ModeSwitch from "@/components/ModeSwitch";
import StoryCard from "@/components/StoryCard";
import { getData } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function Home() {
  const data = await getData();
  const [stalls, campaigns, viewer] = await Promise.all([data.listStalls(), data.listCampaigns(), data.getViewer()]);
  const stallById = new Map(stalls.map((s) => [s.id, s]));
  const stories = campaigns.filter((c) => c.raised < c.goal && stallById.has(c.stallId));

  return (
    <main className="flex flex-1 flex-col">
      <header className="px-4 pb-3 pt-6 md:px-6 md:pt-8">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Bengaluru · ಬೆಂಗಳೂರು</p>
          {isSupabaseConfigured() && <ModeSwitch mode={data.mode} />}
        </div>
        <h1 className="mt-1 text-5xl">
          <span className="signboard">Hissa</span>
        </h1>
        <p className="mt-2 text-lg leading-snug">
          Back the street stalls you love. <span className="text-muted">Grow with them.</span>
        </p>
        {data.mode === "live" && !viewer && (
          <Link
            href="/login"
            className="mt-3 flex items-center justify-between rounded-2xl border-2 border-grow bg-grow-soft px-4 py-3"
          >
            <span>
              <b>Play for real.</b> Sign up and get ₹10,000 of play money.
            </span>
            <span className="font-semibold text-grow">Join →</span>
          </Link>
        )}
      </header>
      <div className="bunting mx-4 mb-5 md:mx-6" />

      {stories.length > 0 && (
        <section className="mb-6 space-y-3">
          <h2 className="px-4 font-display text-xl md:px-6">Stories you can be part of</h2>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:px-6">
            {stories.map((c) => (
              <StoryCard key={c.id} campaign={c} stall={stallById.get(c.stallId)!} />
            ))}
          </div>
        </section>
      )}

      <DiscoverView stalls={stalls} campaigns={campaigns} />
    </main>
  );
}
