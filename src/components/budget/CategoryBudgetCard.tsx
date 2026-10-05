"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Pencil, 
  Plus, 
  Loader2, 
  TrendingUp, 
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { getCategoryIcon, getCategoryColor } from "@/lib/icons";
import Modal from "@/components/ui/Modal";
import { toast } from "sonner";

interface CategoryBudgetItem {
  category: string;
  budget: number | null;
  spent: number;
  remaining: number | null;
  percentage: number;
  status: "normal" | "warning" | "exceeded" | "no_budget";
}

interface BudgetData {
  month: string;
  totalBudget: number;
  totalSpent: number;
  categories: CategoryBudgetItem[];
}

interface CategoryBudgetCardProps {
  onBudgetChange?: () => void;
  refreshTrigger?: number;
}

export default function CategoryBudgetCard({ onBudgetChange, refreshTrigger }: CategoryBudgetCardProps) {
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const currentMonthName = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/budgets?month=${currentMonth}`);
      setData(res.data);
    } catch (err) {
      console.error("Failed to load budgets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [refreshTrigger]);

  const handleOpenEdit = (category: string, currentBudget: number | null) => {
    setEditingCategory(category);
    setBudgetInput(currentBudget ? currentBudget.toString() : "");
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const amount = parseFloat(budgetInput);
    if (isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setSaving(true);
    try {
      await axios.post("/api/budgets", {
        category: editingCategory,
        amount,
        month: currentMonth,
      });

      toast.success(`Budget for ${editingCategory} set to ${formatCurrency(amount)}`);
      setIsModalOpen(false);
      fetchBudgets();
      if (onBudgetChange) onBudgetChange();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update budget");
    } finally {
      setSaving(false);
    }
  };

  // Find exceeded or warning categories
  const exceededCategories = data?.categories.filter((c) => c.status === "exceeded") || [];
  const warningCategories = data?.categories.filter((c) => c.status === "warning") || [];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-2xl">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Monthly Budgets
              <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-medium">
                {currentMonthName}
              </span>
            </h2>
            <p className="text-xs text-slate-400">Track and limit spending per category</p>
          </div>
        </div>

        {data && data.totalBudget > 0 && (
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              Budget Allocated
            </span>
            <span className="text-base font-black text-white">
              {formatCurrency(data.totalSpent)} / <span className="text-purple-400">{formatCurrency(data.totalBudget)}</span>
            </span>
          </div>
        )}
      </div>

      {/* Alert Banner if any budget exceeded */}
      {exceededCategories.length > 0 && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-400 animate-pulse">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-rose-300">
              Budget Alert: {exceededCategories.length} category exceeded!
            </p>
            <p className="mt-0.5 text-rose-400/90">
              {exceededCategories.map((c) => `${c.category} (exceeded by ${formatCurrency(Math.abs(c.remaining || 0))})`).join(", ")}
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4 py-4 animate-pulse">
          <div className="h-14 bg-slate-800/40 rounded-2xl" />
          <div className="h-14 bg-slate-800/40 rounded-2xl" />
          <div className="h-14 bg-slate-800/40 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.categories.map((item) => {
            const Icon = getCategoryIcon(item.category);
            const color = getCategoryColor(item.category);
            const hasBudget = item.budget !== null && item.budget > 0;

            return (
              <div
                key={item.category}
                onClick={() => handleOpenEdit(item.category, item.budget)}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between gap-3 relative overflow-hidden",
                  item.status === "exceeded"
                    ? "bg-rose-950/20 border-rose-500/30 hover:border-rose-500"
                    : item.status === "warning"
                    ? "bg-amber-950/20 border-amber-500/30 hover:border-amber-500"
                    : "bg-slate-800/30 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
                )}
              >
                {/* Top: Category & Stats */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", color.bg, color.text)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-white text-sm font-bold group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                        {item.category}
                        <Pencil className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Spent: <span className="font-bold text-white">{formatCurrency(item.spent)}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    {hasBudget ? (
                      <div>
                        <span className={cn(
                          "text-xs font-black px-2 py-0.5 rounded-lg inline-block",
                          item.status === "exceeded"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : item.status === "warning"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        )}>
                          {item.percentage}%
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          of {formatCurrency(item.budget!)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-[11px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Plus className="w-3 h-3" /> Set Budget
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                {hasBudget ? (
                  <div className="space-y-1">
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
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
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>
                        {item.remaining !== null && item.remaining >= 0
                          ? `${formatCurrency(item.remaining)} left`
                          : `Over by ${formatCurrency(Math.abs(item.remaining || 0))}`}
                      </span>
                      <span>Target: {formatCurrency(item.budget!)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 italic">
                    No monthly limit set
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Set / Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Set Monthly Budget: ${editingCategory}`}
      >
        <form onSubmit={handleSaveBudget} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Monthly Budget for {currentMonthName}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-bold text-xl">
                ₹
              </div>
              <input
                type="number"
                step="50"
                min="0"
                required
                autoFocus
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="e.g. 2000"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all font-bold text-2xl"
              />
            </div>
          </div>

          {/* Quick preset chips: 1k, 2k, 5k, 10k */}
          <div>
            <span className="text-[11px] text-slate-400 font-semibold block mb-2">Quick Presets:</span>
            <div className="flex flex-wrap gap-2">
              {[1000, 2000, 3000, 5000, 10000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBudgetInput(preset.toString())}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  ₹{preset >= 1000 ? `${preset / 1000}k` : preset}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 mt-4 text-sm"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Category Budget"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
