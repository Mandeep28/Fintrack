export default function GoalsLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-secondary/60 rounded-lg" />
          <div className="h-8 w-64 bg-secondary/80 rounded-2xl" />
          <div className="h-4 w-80 bg-secondary/40 rounded-xl" />
        </div>
        <div className="h-12 w-44 bg-secondary/80 rounded-2xl" />
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-3">
            <div className="flex justify-between">
              <div className="h-3 w-28 bg-secondary/60 rounded-md" />
              <div className="h-5 w-12 bg-secondary/50 rounded-lg" />
            </div>
            <div className="h-8 w-36 bg-secondary/80 rounded-xl" />
            <div className="h-3 w-24 bg-secondary/40 rounded-md" />
            <div className="h-2 w-full bg-secondary/50 rounded-full mt-2" />
          </div>
        ))}
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex gap-2 border-b border-border pb-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-28 bg-secondary/60 rounded-2xl" />
        ))}
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 bg-card rounded-3xl border border-border" />
        ))}
      </div>
    </div>
  );
}
