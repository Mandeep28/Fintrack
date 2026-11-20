export default function CategoriesLoading() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-secondary/60 rounded-lg" />
          <div className="h-8 w-60 bg-secondary/80 rounded-2xl" />
          <div className="h-4 w-72 bg-secondary/40 rounded-xl" />
        </div>
        <div className="h-12 w-48 bg-secondary/80 rounded-2xl" />
      </div>

      {/* Month Selector Bar Skeleton */}
      <div className="bg-card border border-border p-4 rounded-3xl h-16 flex items-center justify-between">
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-secondary/70 rounded-2xl" />
          <div className="h-10 w-36 bg-secondary/70 rounded-2xl" />
          <div className="h-10 w-24 bg-secondary/70 rounded-2xl" />
          <div className="h-10 w-10 bg-secondary/70 rounded-2xl" />
        </div>
      </div>

      {/* Summary Stats Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-2">
            <div className="h-3 w-28 bg-secondary/60 rounded-md" />
            <div className="h-7 w-32 bg-secondary/80 rounded-xl" />
          </div>
        ))}
      </div>

      {/* Categories Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-44 bg-card rounded-3xl border border-border" />
        ))}
      </div>
    </div>
  );
}
