"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { 
  Plus, 
  PiggyBank, 
  CreditCard, 
  Trophy, 
  ArrowLeft
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import GoalCard, { GoalItem } from "@/components/goals/GoalCard";
import AddGoalModal from "@/components/goals/AddGoalModal";
import AddContributionModal from "@/components/goals/AddContributionModal";
import GoalDetailsModal from "@/components/goals/GoalDetailsModal";
import { toast } from "sonner";

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
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [summary, setSummary] = useState<GoalsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Tabs: 'ALL' | 'SAVINGS' | 'DEBT' | 'COMPLETED'
  const [activeTab, setActiveTab] = useState<"ALL" | "SAVINGS" | "DEBT" | "COMPLETED">("ALL");

  // Modals state
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);

  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
  const [selectedGoalForMoney, setSelectedGoalForMoney] = useState<GoalItem | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedGoalForDetails, setSelectedGoalForDetails] = useState<GoalItem | null>(null);

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/goals");
      const fetchedGoals = res.data.goals || [];
      setGoals(fetchedGoals);
      setSummary(res.data.summary || null);

      setSelectedGoalForDetails((prev) => {
        if (!prev) return null;
        return fetchedGoals.find((g: GoalItem) => g.id === prev.id) || prev;
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleDeleteGoal = async (id: string) => {
    if (!confirm("Are you sure you want to delete this goal and all its contributions?")) return;
    try {
      await axios.delete(`/api/goals/${id}`);
      toast.success("Goal deleted");
      fetchGoals();
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
    <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground mb-3 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <span className="p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-2xl">
              <PiggyBank className="w-6 h-6" />
            </span>
            Financial Goals & Debt Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track savings for purchases like smartphones or track repayments on loans and debt.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setIsAddGoalModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-primary/20 transition-all text-sm self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Create New Goal
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Overall Card */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Overall Progress
              </span>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20">
                {summary.overallPercentage}%
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
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
          <div className="bg-card border border-emerald-500/20 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <PiggyBank className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                  Savings & Purchases
                </span>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {summary.savings.percentage}%
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
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
          <div className="bg-card border border-violet-500/20 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-violet-500 uppercase tracking-wider">
                  Debt & Loan Payoff
                </span>
              </div>
              <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-violet-500/10 text-violet-500 border border-violet-500/20">
                {summary.debt.percentage}%
              </span>
            </div>
            <p className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
              {formatCurrency(summary.debt.paid)}
            </p>
            <p className="text-xs font-semibold text-muted-foreground mt-1">
              Total Loan: {formatCurrency(summary.debt.target)}
            </p>

            <div className="w-full bg-secondary rounded-full h-2 mt-4 overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(summary.debt.percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-2">
              <span className="text-violet-400 font-bold">Repaid so far</span>
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
            count: goals.filter((g) => g.type === "SAVINGS" && g.status !== "COMPLETED").length 
          },
          { 
            key: "DEBT", 
            label: "Debt & Loans", 
            count: goals.filter((g) => g.type === "DEBT" && g.status !== "COMPLETED").length 
          },
          { 
            key: "COMPLETED", 
            label: "Completed", 
            count: goals.filter((g) => g.status === "COMPLETED" || g.currentAmount >= g.targetAmount).length 
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
      {loading ? (
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
      <AddGoalModal
        isOpen={isAddGoalModalOpen}
        onClose={() => {
          setIsAddGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSuccess={fetchGoals}
        initialGoal={editingGoal}
      />

      {/* Modal: Add Money / Make Payment */}
      <AddContributionModal
        isOpen={isAddMoneyModalOpen}
        onClose={() => {
          setIsAddMoneyModalOpen(false);
          setSelectedGoalForMoney(null);
        }}
        goal={selectedGoalForMoney}
        onSuccess={fetchGoals}
      />

      {/* Modal: Goal Details & History */}
      <GoalDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedGoalForDetails(null);
        }}
        goal={selectedGoalForDetails}
        onRefresh={fetchGoals}
        onOpenAddContribution={(goal) => {
          setSelectedGoalForMoney(goal);
          setIsAddMoneyModalOpen(true);
        }}
      />
    </div>
  );
}
