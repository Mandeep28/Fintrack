export default function ChartSkeleton() {
  return (
    <div className="h-[280px] w-full flex flex-col justify-end gap-3 p-4 animate-pulse">
      <div className="flex items-end justify-between gap-2 h-48 w-full px-4">
        {[40, 65, 30, 80, 50, 90, 70].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-secondary/60 rounded-t-lg transition-all"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground/30 px-2 pt-2 border-t border-border/40">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
    </div>
  );
}
