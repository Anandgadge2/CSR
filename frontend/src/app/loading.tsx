// Route-level loading UI — appears instantly on navigation while the
// target page's JS/data loads, making transitions feel SPA-immediate.
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 md:px-8" aria-busy="true" aria-label="Loading page">
      {/* Page header skeleton */}
      <div className="mb-4 rounded-lg border border-[#e0e4ea] bg-white p-4">
        <div className="h-3 w-40 animate-pulse rounded bg-[#eef0f3]" />
        <div className="mt-3 h-6 w-72 animate-pulse rounded bg-[#e0e4ea]" />
        <div className="mt-2 h-3 w-96 max-w-full animate-pulse rounded bg-[#eef0f3]" />
      </div>

      {/* Content grid skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-[#e0e4ea] bg-white p-4">
            <div className="h-4 w-24 animate-pulse rounded bg-[#e0e4ea]" />
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-[#eef0f3]" />
            <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-[#eef0f3]" />
            <div className="mt-2 h-3 w-3/5 animate-pulse rounded bg-[#eef0f3]" />
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-[#e0e4ea] bg-white p-4">
        <div className="h-4 w-32 animate-pulse rounded bg-[#e0e4ea]" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="mt-3 h-3 w-full animate-pulse rounded bg-[#eef0f3]" />
        ))}
      </div>
    </div>
  );
}
