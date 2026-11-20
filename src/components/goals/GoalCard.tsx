"use client";

import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { getCategoryIcon, getCategoryColor } from "@/lib/icons";
import { 
  PiggyBank, 
  CreditCard, 
  Plus, 
  Pencil, 
  Trash2, 
  CheckCircle2, 
  Calendar, 
  Eye
} from "lucide-react";
import { Contribution } from "./GoalDetailsModal";

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const Icon = getCategoryIcon(category);
  return <Icon className={className} />;
}

export interface GoalItem {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentage: number;
  category: string;
  type: "SAVINGS" | "DEBT";
  deadline?: string | null;
  status: string;
  createdAt: string;
  contributionsCount?: number;
  contributions?: Contribution[];
}

interface GoalCardProps {
  goal: GoalItem;
  onAddMoney: (goal: GoalItem) => void;
  onViewDetails: (goal: GoalItem) => void;
  onEdit: (goal: GoalItem) => void;
  onDelete: (id: string) => void;
}

export default function GoalCard({
  goal,
  onAddMoney,
  onViewDetails,
  onEdit,
  onDelete,
}: GoalCardProps) {
  const isDebt = goal.type === "DEBT";
  const isCompleted = goal.currentAmount >= goal.targetAmount || goal.status === "COMPLETED";
  const color = getCategoryColor(goal.category);

  // Remaining percentage
  const remainingPercentage = Math.max(0, Number((100 - goal.percentage).toFixed(1)));

  return (
    <div
      className={cn(
        "p-6 rounded-3xl border transition-all duration-300 relative bg-card flex flex-col justify-between group shadow-sm hover:shadow-xl hover:-translate-y-1",
        isCompleted
          ? "border-emerald-500/40 bg-emerald-500/[0.02]"
          : isDebt
          ? "border-border hover:border-cyan-500/50"
          : "border-border hover:border-primary/50"
      )}
    >
      <div>
        {/* Top Badges & Actions */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] font-bold tracking-tight",
                isDebt
                  ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                  : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              )}
            >
              {isDebt ? <CreditCard className="w-3.5 h-3.5" /> : <PiggyBank className="w-3.5 h-3.5" />}
              {isDebt ? "Debt Payoff" : "Savings Goal"}
            </span>

            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border", color.bg, color.text, color.border)}>
              <CategoryIcon category={goal.category} className="w-3.5 h-3.5" />
              <span>{goal.category}</span>
            </span>
          </div>

          {/* Action buttons (Edit, Delete) */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all cursor-pointer"
              title="Edit goal"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(goal.id)}
              className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
              title="Delete goal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
            <span className="truncate">{goal.title}</span>
            {isCompleted && (
              <span className="shrink-0 p-1 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            )}
          </h3>
          {goal.deadline && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
              Target: {formatDate(goal.deadline)}
            </p>
          )}
        </div>

        {/* Main Progress Amount Display */}
        <div className="space-y-1 mb-5">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-foreground tracking-tight">
              {formatCurrency(goal.currentAmount)}
            </span>
            <span className="text-xs font-bold text-muted-foreground">
              of {formatCurrency(goal.targetAmount)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">
            {isDebt ? "Paid Off" : "Saved So Far"}
          </p>
        </div>

        {/* Visual Progress Bar & % Indicators */}
        <div className="space-y-2 mb-5">
          <div className="flex justify-between items-center text-xs">
            <span
              className={cn(
                "font-black text-sm",
                isCompleted
                  ? "text-emerald-500"
                  : isDebt
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-primary"
              )}
            >
              {goal.percentage}% {isCompleted ? "Completed! 🎉" : "Done"}
            </span>

            <span className="text-xs font-bold text-muted-foreground">
              {goal.remainingAmount > 0
                ? `${formatCurrency(goal.remainingAmount)} left (${remainingPercentage}%)`
                : "Goal Achieved!"}
            </span>
          </div>

          <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden p-0.5">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out",
                isCompleted
                  ? "bg-emerald-500"
                  : isDebt
                  ? "bg-cyan-500"
                  : "bg-emerald-500"
              )}
              style={{ width: `${Math.min(goal.percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-4 border-t border-border/50 flex items-center gap-2">
        <button
          onClick={() => onAddMoney(goal)}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer",
            isCompleted
              ? "bg-secondary hover:bg-secondary/80 text-foreground border border-border"
              : isDebt
              ? "bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold shadow-cyan-500/20"
              : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20"
          )}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isDebt ? "Make Payment" : "Add Money"}</span>
        </button>

        <button
          onClick={() => onViewDetails(goal)}
          className="p-2.5 bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground border border-border rounded-xl transition-all cursor-pointer"
          title="View history & details"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
