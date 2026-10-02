// Shown instantly on every tab switch (Next prefetches it), while the page's data loads.
export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading" className="flex-1 space-y-5 px-4 pt-6 md:px-6 md:pt-8">
      <div className="h-4 w-32 animate-pulse rounded-full bg-line" />
      <div className="h-10 w-56 animate-pulse rounded-2xl bg-line" />
      <div className="bunting opacity-40" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex gap-3 rounded-2xl border-2 border-line bg-surface p-3">
            <div className="size-20 shrink-0 animate-pulse rounded-xl bg-line" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 w-3/4 animate-pulse rounded-full bg-line" />
              <div className="h-3 w-1/2 animate-pulse rounded-full bg-line" />
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-line" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
