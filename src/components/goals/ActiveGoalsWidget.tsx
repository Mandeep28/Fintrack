"use client";

import Link from "next/link";
import { 
  PiggyBank, 
  CreditCard, 
  Plus, 
  ArrowRight, 
  ChevronRight
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { getCategoryIcon, getCategoryColor } from "@/lib/icons";

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const Icon = getCategoryIcon(category);
  return <Icon className={className} />;
}

export interface GoalWidgetItem {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentage: number;
  category: string;
  type: "SAVINGS" | "DEBT";
  status: string;
}

interface ActiveGoalsWidgetProps {
  goals: GoalWidgetItem[];
  loading?: boolean;
  onAddMoneyClick?: (goal: GoalWidgetItem) => void;
}

export default function ActiveGoalsWidget({
  goals,
  loading,
  onAddMoneyClick,
}: ActiveGoalsWidgetProps) {
  // Show active/in-progress goals first, limit to 4
  const activeGoals = goals
    .filter((g) => g.status !== "COMPLETED" && g.currentAmount < g.targetAmount)
    .slice(0, 4);

  return (
    <div className="bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-xl flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
              <PiggyBank className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Financial Goals</h2>
              <p className="text-[11px] text-muted-foreground">Savings & Debt targets</p>
            </div>
          </div>

          <Link
            href="/goals"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Goals List */}
        {loading ? (
          <div className="space-y-4 animate-pulse py-2">
            <div className="h-16 bg-secondary/50 rounded-2xl" />
            <div className="h-16 bg-secondary/50 rounded-2xl" />
            <div className="h-16 bg-secondary/50 rounded-2xl" />
          </div>
        ) : activeGoals.length === 0 ? (
          <div className="text-center py-8 px-4 bg-secondary/20 rounded-3xl border border-dashed border-border my-2">
            <PiggyBank className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-bold text-foreground">No active goals</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Set a savings target for a purchase or track loan repayments.
            </p>
            <Link
              href="/goals"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Create First Goal
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {activeGoals.map((item) => {
              const isDebt = item.type === "DEBT";
              const color = getCategoryColor(item.category);

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-secondary/30 border border-border hover:border-border/80 transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", color.bg, color.text)}>
                        {isDebt ? <CreditCard className="w-4 h-4" /> : <CategoryIcon category={item.category} className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                          {item.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {isDebt ? "Paid " : "Saved "}
                          <span className="font-bold text-foreground">{formatCurrency(item.currentAmount)}</span>
                          {" / "}{formatCurrency(item.targetAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={cn(
                          "text-[10px] font-black px-2 py-0.5 rounded-lg",
                          isDebt
                            ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        )}
                      >
                        {item.percentage}%
                      </span>

                      {onAddMoneyClick && (
                        <button
                          onClick={() => onAddMoneyClick(item)}
                          className="p-1 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all cursor-pointer"
                          title={isDebt ? "Record payment" : "Add money"}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isDebt ? "bg-cyan-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                    <span>
                      {isDebt ? "Remaining loan: " : "Left to save: "}
                      <span className="font-bold text-foreground">{formatCurrency(item.remainingAmount)}</span>
                    </span>
                    <span className="font-semibold">
                      {Math.max(0, Number((100 - item.percentage).toFixed(0)))}% left
                    </span>
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
          href="/goals"
          className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center justify-between transition-colors cursor-pointer"
        >
          <span>Track all goals & loans</span>
          <ArrowRight className="w-3.5 h-3.5 text-primary" />
        </Link>
      </div>
    </div>
  );
}
