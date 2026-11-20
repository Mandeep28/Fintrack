export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse max-w-7xl mx-auto pb-20">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border pb-6">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-secondary/80 rounded-2xl" />
          <div className="h-4 w-72 bg-secondary/50 rounded-xl" />
        </div>
        <div className="flex gap-3">
          <div className="h-12 w-44 bg-secondary/60 rounded-2xl" />
          <div className="h-12 w-36 bg-secondary/80 rounded-2xl" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="h-3 w-32 bg-secondary/60 rounded-lg" />
            <div className="h-8 w-40 bg-secondary/80 rounded-xl" />
            <div className="h-5 w-24 bg-secondary/40 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Trend + Active Budgets Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-6 w-36 bg-secondary/70 rounded-xl" />
            <div className="h-6 w-24 bg-secondary/50 rounded-xl" />
          </div>
          <div className="h-[280px] bg-secondary/30 rounded-2xl" />
        </div>
        <div className="lg:col-span-1 bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-sm space-y-4">
          <div className="h-6 w-32 bg-secondary/70 rounded-xl" />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-secondary/40 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-border/40">
          <div className="h-6 w-40 bg-secondary/70 rounded-xl" />
          <div className="h-6 w-28 bg-secondary/50 rounded-xl" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-secondary/30 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
