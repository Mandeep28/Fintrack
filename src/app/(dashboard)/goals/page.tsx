"use client";

import { useState, useMemo } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import {
  Plus,
  PiggyBank,
  CreditCard,
  Trophy,
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import GoalCard, { GoalItem } from "@/components/goals/GoalCard";
import { toast } from "sonner";
import { useGoalsQuery, useInvalidateData } from "@/hooks/useQueries";
import Breadcrumb from "@/components/ui/Breadcrumb";

// Dynamically import modals
const AddGoalModal = dynamic(
  () => import("@/components/goals/AddGoalModal"),
  { ssr: false }
);
const AddContributionModal = dynamic(
  () => import("@/components/goals/AddContributionModal"),
  { ssr: false }
);
const GoalDetailsModal = dynamic(
  () => import("@/components/goals/GoalDetailsModal"),
  { ssr: false }
);

interface GoalsSummary {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalTarget: number;
  totalCurrent: number;
  totalRemaining: number;
  overallPercentage: number;
  savings: {
    target: number;
    saved: number;
    remaining: number;
    percentage: number;
  };
  debt: {
    target: number;
    paid: number;
    remaining: number;
    percentage: number;
  };
}

export default function GoalsPage() {
  // Tabs: 'ALL' | 'SAVINGS' | 'DEBT' | 'COMPLETED'
  const [activeTab, setActiveTab] = useState<"ALL" | "SAVINGS" | "DEBT" | "COMPLETED">("ALL");

  // TanStack Query for instant cached loading & background updates
  const { data: rawGoalsData, isLoading } = useGoalsQuery();
  const { invalidateGoals } = useInvalidateData();

  const goals = useMemo(() => (rawGoalsData?.goals || []) as GoalItem[], [rawGoalsData]);
  const summary = useMemo(() => (rawGoalsData?.summary || null) as GoalsSummary | null, [rawGoalsData]);

  // Modals state
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);

  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
  const [selectedGoalForMoney, setSelectedGoalForMoney] = useState<GoalItem | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedGoalForDetails, setSelectedGoalForDetails] = useState<GoalItem | null>(null);

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal and all its contributions?")) return;
    try {
      await axios.delete(`/api/goals/${id}`);
      toast.success("Goal deleted");
      invalidateGoals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete goal");
    }
  };

  const handleOpenEdit = (goal: GoalItem) => {
    setEditingGoal(goal);
    setIsAddGoalModalOpen(true);
  };

  const handleOpenAddMoney = (goal: GoalItem) => {
    setSelectedGoalForMoney(goal);
    setIsAddMoneyModalOpen(true);
  };

  const handleOpenDetails = (goal: GoalItem) => {
    setSelectedGoalForDetails(goal);
    setIsDetailsModalOpen(true);
  };

  // Filtered goals
  const filteredGoals = useMemo(() => {
    if (activeTab === "SAVINGS") {
      return goals.filter((g) => g.type === "SAVINGS" && g.status !== "COMPLETED");
    }
    if (activeTab === "DEBT") {
      return goals.filter((g) => g.type === "DEBT" && g.status !== "COMPLETED");
    }
    if (activeTab === "COMPLETED") {
      return goals.filter((g) => g.status === "COMPLETED" || g.currentAmount >= g.targetAmount);
    }
    return goals;
  }, [goals, activeTab]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in duration-300">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Goals & Debt" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2.5 sm:gap-3">
            <span className="p-2 sm:p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl sm:rounded-2xl">
              <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6" />
            </span>
            Financial Goals & Debt Tracker
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track savings for purchases like smartphones or track repayments on loans and debt.
          </p>
        </div>

        <div>
          <button
            onClick={() => {
              setEditingGoal(null);
              setIsAddGoalModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-md shadow-primary/20 transition-all text-xs sm:text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 sm:w-4 sm:h-4" />
            <span>Create New Goal</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
          {/* Overall Card */}
          <div className="bg-card border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Overall Progress
              </span>
              <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl bg-primary/10 text-primary border border-primary/20">
                {summary.overallPercentage}%
              </span>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight">
              {formatCurrency(summary.totalCurrent)}
            </p>
            <p className="text-xs font-semibold text-muted-foreground mt-1">
              of {formatCurrency(summary.totalTarget)} total targets
            </p>

            <div className="w-full bg-secondary rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(summary.overallPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-2">
              <span>{summary.activeGoals} active goals</span>
              <span>{summary.completedGoals} completed</span>
            </div>
          </div>

          {/* Savings / Purchase Goals Card */}
          <div className="bg-card border border-emerald-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <PiggyBank className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-emerald-500 uppercase tracking-wider">
                  Savings & Purchases
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {summary.savings.percentage}%
              </span>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight">
              {formatCurrency(summary.savings.saved)}
            </p>
            <p className="text-xs font-semibold text-muted-foreground mt-1">
              Target: {formatCurrency(summary.savings.target)}
            </p>

            <div className="w-full bg-secondary rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(summary.savings.percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-2">
              <span className="text-emerald-400 font-bold">Saved so far</span>
              <span>{formatCurrency(summary.savings.remaining)} left</span>
            </div>
          </div>

          {/* Debt & Loan Payoff Card */}
          <div className="bg-card border border-cyan-500/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                  Debt & Loan Payoff
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg sm:rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                {summary.debt.percentage}%
              </span>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-foreground tracking-tight">
              {formatCurrency(summary.debt.paid)}
            </p>
            <p className="text-xs font-semibold text-muted-foreground mt-1">
              Total Loan: {formatCurrency(summary.debt.target)}
            </p>

            <div className="w-full bg-secondary rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(summary.debt.percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-2">
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">Repaid so far</span>
              <span>{formatCurrency(summary.debt.remaining)} left</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { key: "ALL", label: "All Goals", count: goals.length },
          {
            key: "SAVINGS",
            label: "Savings & Purchases",
            count: goals.filter((g) => g.type === "SAVINGS" && g.status !== "COMPLETED").length,
          },
          {
            key: "DEBT",
            label: "Debt & Loans",
            count: goals.filter((g) => g.type === "DEBT" && g.status !== "COMPLETED").length,
          },
          {
            key: "COMPLETED",
            label: "Completed",
            count: goals.filter((g) => g.status === "COMPLETED" || g.currentAmount >= g.targetAmount).length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              "px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
              activeTab === tab.key
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-lg text-[10px] font-black",
                activeTab === tab.key
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {isLoading && !rawGoalsData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-card rounded-3xl border border-border" />
          ))}
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="text-center py-20 px-6 bg-secondary/20 rounded-3xl border border-dashed border-border">
          <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
            {activeTab === "DEBT" ? (
              <CreditCard className="w-8 h-8" />
            ) : activeTab === "COMPLETED" ? (
              <Trophy className="w-8 h-8" />
            ) : (
              <PiggyBank className="w-8 h-8" />
            )}
          </div>
          <h3 className="text-lg font-bold text-foreground">
            {activeTab === "COMPLETED"
              ? "No completed goals yet"
              : activeTab === "DEBT"
              ? "No debt or loan payoff goals yet"
              : activeTab === "SAVINGS"
              ? "No savings goals set yet"
              : "No financial goals found"}
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-6">
            {activeTab === "DEBT"
              ? "Add loans or debts to track exactly how much you have paid out and how much is left."
              : "Create a goal for your next smartphone, laptop, vacation, or emergency fund to track your progress visually."}
          </p>
          <button
            onClick={() => {
              setEditingGoal(null);
              setIsAddGoalModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-xs font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onAddMoney={handleOpenAddMoney}
              onViewDetails={handleOpenDetails}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>
      )}

      {/* Modal: Create / Edit Goal */}
      {isAddGoalModalOpen && (
        <AddGoalModal
          isOpen={isAddGoalModalOpen}
          onClose={() => {
            setIsAddGoalModalOpen(false);
            setEditingGoal(null);
          }}
          onSuccess={invalidateGoals}
          initialGoal={editingGoal}
        />
      )}

      {/* Modal: Add Money / Make Payment */}
      {isAddMoneyModalOpen && (
        <AddContributionModal
          isOpen={isAddMoneyModalOpen}
          onClose={() => {
            setIsAddMoneyModalOpen(false);
            setSelectedGoalForMoney(null);
          }}
          goal={selectedGoalForMoney}
          onSuccess={invalidateGoals}
        />
      )}

      {/* Modal: Goal Details & History */}
      {isDetailsModalOpen && (
        <GoalDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedGoalForDetails(null);
          }}
          goal={selectedGoalForDetails}
          onRefresh={invalidateGoals}
          onOpenAddContribution={(goal) => {
            setSelectedGoalForMoney(goal);
            setIsAddMoneyModalOpen(true);
          }}
        />
      )}
    </div>
  );
}
