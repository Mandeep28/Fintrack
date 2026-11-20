export default function ActivityLoading() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-secondary/60 rounded-lg" />
          <div className="h-8 w-64 bg-secondary/80 rounded-2xl" />
          <div className="h-4 w-72 bg-secondary/40 rounded-xl" />
        </div>
        <div className="h-16 w-48 bg-secondary/80 rounded-2xl" />
      </div>

      {/* Filters Bar Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-2 lg:col-span-4 h-12 bg-secondary/50 rounded-2xl" />
        <div className="sm:col-span-1 lg:col-span-2 h-12 bg-secondary/50 rounded-2xl" />
        <div className="sm:col-span-1 lg:col-span-2 h-12 bg-secondary/50 rounded-2xl" />
        <div className="sm:col-span-1 lg:col-span-3 h-12 bg-secondary/50 rounded-2xl" />
        <div className="sm:col-span-1 lg:col-span-1 h-12 bg-secondary/50 rounded-2xl" />
      </div>

      {/* Table Skeleton */}
      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm p-6 space-y-4">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="h-12 bg-secondary/30 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
