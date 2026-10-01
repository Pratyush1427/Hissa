const FACES = ["👩🏽", "🧑🏾", "👨🏽", "👵🏽", "🧔🏽", "👩🏻", "👨🏾", "🧑🏽"];

// Overlapping faces + count: backing is something neighbours do together.
export default function Neighbours({ count, label = "neighbours backing" }: { count: number; label?: string }) {
  const shown = Math.min(4, count);
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {Array.from({ length: shown }, (_, i) => (
          <span
            key={i}
            className="grid size-7 place-items-center rounded-full border-2 border-surface bg-gold-soft text-sm"
          >
            {FACES[(count + i) % FACES.length]}
          </span>
        ))}
      </div>
      <span className="text-sm text-muted">
        <b className="text-ink">{count}</b> {label}
      </span>
    </div>
  );
}
