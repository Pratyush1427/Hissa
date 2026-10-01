import type { Milestone } from "@/lib/types";

const statusStyle = {
  done: { dot: "bg-grow text-white", icon: "✓" },
  in_progress: { dot: "bg-gold text-ink", icon: "●" },
  locked: { dot: "border-2 border-dashed border-steel bg-surface text-muted", icon: "" },
};

export default function MilestoneList({ milestones }: { milestones: Milestone[] }) {
  return (
    <ol className="space-y-3">
      {milestones.map((m, i) => {
        const s = statusStyle[m.status];
        return (
          <li key={m.title} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`grid size-7 place-items-center rounded-full text-xs font-bold ${s.dot}`}>{s.icon}</span>
              {i < milestones.length - 1 && <span className="mt-1 w-0.5 flex-1 bg-line" />}
            </div>
            <div className="pb-1">
              <p className={`font-semibold ${m.status === "locked" ? "text-muted" : ""}`}>{m.title}</p>
              <p className="text-sm text-muted">🎁 {m.reward}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
