import Link from "next/link";
import { getData } from "@/lib/data";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function CriticsPage() {
  const data = await getData();
  const [ranked, viewer] = await Promise.all([data.listCritics(), data.getViewer()]);
  const myId = viewer?.critic.id;

  return (
    <main className="flex-1 space-y-5 px-4 pt-6 md:mx-auto md:w-full md:max-w-2xl md:px-6">
      <header>
        <h1 className="font-display text-4xl text-brand">Namma critics</h1>
        <p className="mt-1 text-lg">
          Taste score rises when stalls you rate, find or back early go on to grow.
        </p>
      </header>
      <div className="bunting" />
      {data.mode === "live" && !viewer && (
        <Link href="/login?next=/critics" className="block rounded-2xl border-2 border-grow bg-grow-soft p-4">
          <b>Join the leaderboard.</b> Rate, find and back stalls to climb it. <span className="text-grow">Sign up →</span>
        </Link>
      )}

      <ol className="space-y-2">
        {ranked.map((c, i) => (
          <li
            key={c.id}
            className={`flex items-center gap-3 rounded-2xl border-2 bg-surface p-3 ${
              c.id === myId ? "border-brand" : "border-line"
            }`}
          >
            <span className="w-7 text-center text-lg font-bold text-muted">{MEDALS[i] ?? i + 1}</span>
            <span className="grid size-12 place-items-center rounded-full bg-gold-soft text-3xl">{c.avatar}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">
                {c.name} {c.id === myId && <span className="text-xs text-brand">(you)</span>}
              </p>
              <p className="truncate text-xs text-muted">{c.persona}</p>
              <p className="text-xs text-muted">
                {c.reviews} reviews · {c.stallsSuggested} stalls found · {c.followers.toLocaleString("en-IN")} followers
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-xl text-brand">{c.tasteScore}</p>
              <p className="text-[10px] uppercase text-muted">taste</p>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
