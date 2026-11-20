"use client";

import { useState } from "react";
import axios from "axios";
import Modal from "@/components/ui/Modal";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getCategoryIcon, getCategoryColor } from "@/lib/icons";
import { 
  PiggyBank, 
  CreditCard, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  History, 
  Target
} from "lucide-react";
import { toast } from "sonner";

function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const Icon = getCategoryIcon(category);
  return <Icon className={className} />;
}

export interface Contribution {
  id: string;
  amount: number;
  note?: string | null;
  date: string;
}

export interface Goal {
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
  contributions?: Contribution[];
}

interface GoalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  onRefresh: () => void;
  onOpenAddContribution: (goal: Goal) => void;
}

export default function GoalDetailsModal({
  isOpen,
  onClose,
  goal,
  onRefresh,
  onOpenAddContribution,
}: GoalDetailsModalProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!goal) return null;

  const isDebt = goal.type === "DEBT";
  const color = getCategoryColor(goal.category);
  const isCompleted = goal.currentAmount >= goal.targetAmount || goal.status === "COMPLETED";

  const handleDeleteContribution = async (contributionId: string) => {
    if (!confirm("Are you sure you want to remove this contribution entry?")) return;

    setDeletingId(contributionId);
    try {
      await axios.delete(`/api/goals/${goal.id}/contributions/${contributionId}`);
      toast.success("Entry removed");
      onRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to remove entry");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goal.title}
    >
      <div className="space-y-6">
        {/* Top Badges & Type */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                isDebt
                  ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                  : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              }`}
            >
              {isDebt ? <CreditCard className="w-3.5 h-3.5" /> : <PiggyBank className="w-3.5 h-3.5" />}
              {isDebt ? "Debt / Loan Payoff" : "Savings & Purchase"}
            </span>

            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${color.bg} ${color.text} border ${color.border}`}>
              <CategoryIcon category={goal.category} className="w-3.5 h-3.5" />
              {goal.category}
            </span>
          </div>

          {isCompleted ? (
            <span className="inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Target className="w-3.5 h-3.5" /> Active Goal
            </span>
          )}
        </div>

        {/* Progress & Financial Overview Card */}
        <div className="p-5 rounded-3xl bg-secondary/40 border border-border space-y-4">
          <div className="flex justify-between items-baseline">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                {isDebt ? "Total Paid Out" : "Total Saved"}
              </p>
              <p className="text-3xl font-black text-foreground tracking-tight mt-1">
                {formatCurrency(goal.currentAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                {isDebt ? "Total Loan" : "Target Goal"}
              </p>
              <p className="text-xl font-bold text-muted-foreground mt-1">
                {formatCurrency(goal.targetAmount)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCompleted
                    ? "bg-emerald-500"
                    : isDebt
                    ? "bg-cyan-500"
                    : "bg-primary"
                }`}
                style={{ width: `${Math.min(goal.percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className={isDebt ? "text-cyan-600 dark:text-cyan-400" : "text-emerald-400"}>
                {goal.percentage}% {isDebt ? "paid off" : "saved"}
              </span>
              <span className="text-muted-foreground">
                {goal.remainingAmount > 0
                  ? `${formatCurrency(goal.remainingAmount)} left`
                  : "Fully reached!"}
              </span>
            </div>
          </div>

          {/* Additional details: Deadline & Created Date */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/40 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Target Date</span>
              <span className="font-bold text-foreground">
                {goal.deadline ? formatDate(goal.deadline) : "No deadline set"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">Started On</span>
              <span className="font-bold text-foreground">
                {formatDate(goal.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Action button: Add money / Record payment */}
        <button
          onClick={() => {
            onClose();
            onOpenAddContribution(goal);
          }}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {isDebt ? "Record Another Payment" : "Add Money to this Goal"}
        </button>

        {/* Contributions Timeline / History */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
            <History className="w-4 h-4 text-primary" />
            <span>Contribution History ({(goal.contributions || []).length})</span>
          </div>

          {(!goal.contributions || goal.contributions.length === 0) ? (
            <div className="text-center py-8 bg-secondary/20 rounded-2xl border border-dashed border-border">
              <p className="text-xs text-muted-foreground">No contributions recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {(goal.contributions || []).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-secondary/30 border border-border/70 flex items-center justify-between group hover:border-primary/40 transition-all"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-foreground">
                        +{formatCurrency(item.amount)}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.date)}
                      </span>
                    </div>
                    {item.note && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {item.note}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteContribution(item.id)}
                    disabled={deletingId === item.id}
                    className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                    title="Remove entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
