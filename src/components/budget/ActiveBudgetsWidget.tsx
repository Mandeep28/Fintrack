"use client";

import Link from "next/link";
import { Target, ChevronRight, AlertTriangle, ArrowRight, Plus } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { getCategoryIcon, getCategoryColor } from "@/lib/icons";

export interface CategoryBudgetItem {
  category: string;
  budget: number | null;
  spent: number;
  remaining: number | null;
  percentage: number;
  status: "normal" | "warning" | "exceeded" | "no_budget";
}

interface ActiveBudgetsWidgetProps {
  categories: CategoryBudgetItem[];
  loading?: boolean;
  onAlertClick?: (item: CategoryBudgetItem) => void;
}

export default function ActiveBudgetsWidget({ categories, loading, onAlertClick }: ActiveBudgetsWidgetProps) {
  // Filter only categories where user set a budget
  const activeBudgets = categories.filter((c) => c.budget !== null && c.budget > 0);

  return (
    <div className="bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-xl flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Active Budgets</h2>
              <p className="text-[11px] text-muted-foreground">Monthly spending targets</p>
            </div>
          </div>
        </div>

        {/* Budgets List */}
        {loading ? (
          <div className="space-y-4 animate-pulse py-2">
            <div className="h-16 bg-secondary/50 rounded-2xl" />
            <div className="h-16 bg-secondary/50 rounded-2xl" />
            <div className="h-16 bg-secondary/50 rounded-2xl" />
          </div>
        ) : activeBudgets.length === 0 ? (
          <div className="text-center py-10 px-4 bg-secondary/20 rounded-3xl border border-dashed border-border my-2">
            <Target className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-bold text-foreground">No budgets set yet</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Set limits for food, travel, and more to keep your expenses in check.
            </p>
            <Link
              href="/categories"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-sm hover:bg-primary/90 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Set First Budget
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {activeBudgets.map((item) => {
              const Icon = getCategoryIcon(item.category);
              const color = getCategoryColor(item.category);

              return (
                <div
                  key={item.category}
                  className={cn(
                    "p-3.5 rounded-2xl border transition-all space-y-2",
                    item.status === "exceeded"
                      ? "bg-rose-950/20 border-rose-500/30"
                      : item.status === "warning"
                      ? "bg-amber-950/20 border-amber-500/30"
                      : "bg-secondary/30 border-border hover:border-border/80"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", color.bg, color.text)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        {/* Category Name + Alert Sign if Exceeded */}
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-foreground truncate">{item.category}</p>
                          {item.status === "exceeded" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAlertClick?.(item);
                              }}
                              className="text-rose-500 hover:text-rose-400 p-0.5 rounded transition-transform hover:scale-125 cursor-pointer shrink-0"
                              title={`Budget exceeded for ${item.category}! Click for info`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {formatCurrency(item.spent)} / {formatCurrency(item.budget!)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0",
                        item.status === "exceeded"
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          : item.status === "warning"
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      )}
                    >
                      {item.percentage}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        item.status === "exceeded"
                          ? "bg-rose-500"
                          : item.status === "warning"
                          ? "bg-amber-400"
                          : "bg-emerald-500"
                      )}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer link to manage all */}
      <div className="pt-4 border-t border-border mt-4">
        <Link
          href="/categories"
          className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-between transition-colors"
        >
          <span>Manage all categories & limits</span>
          <ArrowRight className="w-3.5 h-3.5 text-primary" />
        </Link>
      </div>
    </div>
  );
}
