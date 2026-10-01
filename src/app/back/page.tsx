import Link from "next/link";
import Neighbours from "@/components/Neighbours";
import StallPhoto from "@/components/StallPhoto";
import StoryCard from "@/components/StoryCard";
import { getData } from "@/lib/data";

export default async function SupportPage() {
  const data = await getData();
  const [campaigns, stalls] = await Promise.all([data.listCampaigns(), data.listStalls()]);
  const stallById = new Map(stalls.map((s) => [s.id, s]));
  const getStall = (id: string) => stallById.get(id);
  const open = campaigns.filter((c) => c.raised < c.goal && c.endsInDays > 0 && stallById.has(c.stallId));
  const funded = campaigns.filter((c) => c.raised >= c.goal && stallById.has(c.stallId));

  return (
    <main className="flex-1 space-y-6 pt-6 md:pt-8">
      <header className="px-4 md:px-6">
        <h1 className="font-display text-4xl text-brand">Support a stall</h1>
        <p className="mt-1 text-lg">Small amounts from many neighbours help a vendor take the next step.</p>
      </header>
      <div className="bunting mx-4 md:mx-6" />

      <section className="grid gap-3 px-4 md:grid-cols-2 md:px-6 lg:grid-cols-3">
        {open.map((c) => (
          <div key={c.id} className="[&>a]:w-full">
            <StoryCard campaign={c} stall={getStall(c.stallId)!} />
          </div>
        ))}
      </section>

      {funded.length > 0 && (
        <section className="space-y-3 px-4 md:px-6">
          <h2 className="font-display text-xl">Made possible by neighbours</h2>
          {funded.map((c) => {
            const stall = getStall(c.stallId)!;
            const current = c.milestones.find((m) => m.status !== "done");
            return (
              <Link
                key={c.id}
                href={`/stalls/${stall.id}#campaign`}
                className="flex items-center gap-3 rounded-2xl border-2 border-line bg-surface p-3"
              >
                <StallPhoto stall={stall} className="size-14 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="font-semibold leading-tight">
                    {stall.vendorName.split(" ")[0]} got {c.shortGoal}
                  </p>
                  <p className="text-sm text-muted">{current ? `Next: ${current.title}` : "Every milestone reached 🎉"}</p>
                  <Neighbours count={c.backers} label="neighbours" />
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </main>
  );
}
