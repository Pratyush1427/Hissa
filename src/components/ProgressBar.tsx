export default function ProgressBar({ value, tone = "brand" }: { value: number; tone?: "brand" | "grow" }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full border border-line bg-background">
      <div
        className={`h-full rounded-full ${tone === "grow" ? "bg-grow" : "bg-gold"}`}
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}
