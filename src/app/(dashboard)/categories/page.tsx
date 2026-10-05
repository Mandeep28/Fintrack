"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { 
  Target, 
  Plus, 
  Pencil, 
  Loader2, 
  ArrowLeft, 
  AlertTriangle,
  FolderPlus,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { getCategoryIcon, getCategoryColor } from "@/lib/icons";
import Modal from "@/components/ui/Modal";
import BudgetExceededModal from "@/components/budget/BudgetExceededModal";
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

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear - i);

export default function CategoriesPage() {
  const [data, setData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);

  // Month and Year state
  const today = new Date();
  const currentYearStr = today.getFullYear().toString();
  const currentMonthStr = String(today.getMonth() + 1).padStart(2, "0");

  const [selectedYear, setSelectedYear] = useState(currentYearStr);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const monthQuery = `${selectedYear}-${selectedMonth}`;
  const isCurrentMonth = selectedYear === currentYearStr && selectedMonth === currentMonthStr;

  // Edit budget modal state
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [savingBudget, setSavingBudget] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // New custom category modal state
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryBudget, setNewCategoryBudget] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  // Exceeded alert modal state
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [selectedExceededItem, setSelectedExceededItem] = useState<CategoryBudgetItem | null>(null);

  const monthName = useMemo(() => {
    const mIndex = parseInt(selectedMonth, 10) - 1;
    const mObj = MONTHS[mIndex];
    return `${mObj ? mObj.label : selectedMonth} ${selectedYear}`;
  }, [selectedMonth, selectedYear]);

  const handlePrevMonth = () => {
    let y = parseInt(selectedYear, 10);
    let m = parseInt(selectedMonth, 10);
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setSelectedYear(y.toString());
    setSelectedMonth(String(m).padStart(2, "0"));
  };

  const handleNextMonth = () => {
    let y = parseInt(selectedYear, 10);
    let m = parseInt(selectedMonth, 10);
    m += 1;
    if (m > 12) {
      if (y >= currentYear) return; // Year cannot exceed current year
      m = 1;
      y += 1;
    }
    setSelectedYear(y.toString());
    setSelectedMonth(String(m).padStart(2, "0"));
  };

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/budgets?month=${monthQuery}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories and budgets");
    } finally {
      setLoading(false);
    }
  }, [monthQuery]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleOpenBudgetModal = (category: string, currentBudget: number | null) => {
    setEditingCategory(category);
    setBudgetInput(currentBudget ? currentBudget.toString() : "");
    setIsBudgetModalOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const amount = parseFloat(budgetInput);
    if (isNaN(amount) || amount < 0) {
      toast.error("Please enter a valid budget amount");
      return;
    }

    setSavingBudget(true);
    try {
      await axios.post("/api/budgets", {
        category: editingCategory,
        amount,
        month: monthQuery,
      });

      toast.success(`Budget for ${editingCategory} saved for ${monthName}`);
      setIsBudgetModalOpen(false);
      fetchBudgets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update budget");
    } finally {
      setSavingBudget(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newCategoryName.trim();
    if (!cleanName) {
      toast.error("Please provide a category name");
      return;
    }

    const budgetNum = newCategoryBudget ? parseFloat(newCategoryBudget) : null;
    if (budgetNum !== null && (isNaN(budgetNum) || budgetNum < 0)) {
      toast.error("Please enter a valid budget");
      return;
    }

    setSavingCategory(true);
    try {
      await axios.post("/api/categories", {
        name: cleanName,
        budgetAmount: budgetNum,
        month: monthQuery,
      });

      toast.success(`Category "${cleanName}" created!`);
      setIsNewCategoryModalOpen(false);
      setNewCategoryName("");
      setNewCategoryBudget("");
      fetchBudgets();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setSavingCategory(false);
    }
  };

  const exceededList = data?.categories.filter((c) => c.status === "exceeded") || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
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
              <Target className="w-6 h-6" />
            </span>
            Categories & Budgets
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage spending limits and track targets for <span className="font-bold text-foreground">{monthName}</span>.
          </p>
        </div>

        <button
          onClick={() => setIsNewCategoryModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-primary/20 transition-all text-sm self-start sm:self-auto cursor-pointer"
        >
          <FolderPlus className="w-5 h-5" />
          Add Custom Category
        </button>
      </div>

      {/* Month & Year Selector Bar */}
      <div className="bg-card border border-border p-3 sm:p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Previous Month */}
          <button
            onClick={handlePrevMonth}
            className="p-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-2xl border border-border transition-all cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Month Dropdown */}
          <div className="relative min-w-[140px] flex-1 sm:flex-none">
            <Calendar className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-secondary/50 border border-border text-foreground font-bold text-sm rounded-2xl pl-10 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none"
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Year Dropdown */}
          <div className="relative min-w-[100px]">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-secondary/50 border border-border text-foreground font-bold text-sm rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer appearance-none text-center"
            >
              {YEARS.map((y) => (
                <option key={y} value={y.toString()}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Next Month */}
          <button
            onClick={handleNextMonth}
            className="p-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-2xl border border-border transition-all cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {!isCurrentMonth && (
          <button
            onClick={() => {
              setSelectedYear(currentYearStr);
              setSelectedMonth(currentMonthStr);
            }}
            className="text-xs font-bold text-primary hover:underline px-3 py-1.5 self-start sm:self-auto cursor-pointer rounded-xl bg-primary/10 border border-primary/20"
          >
            Jump to Current Month
          </button>
        )}
      </div>

      {/* Summary stats */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Month Spend</p>
            <p className="text-2xl font-black text-foreground">{formatCurrency(data.totalSpent)}</p>
          </div>
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Allocated Budget</p>
            <p className="text-2xl font-black text-purple-400">{formatCurrency(data.totalBudget)}</p>
          </div>
          <div className="bg-card border border-border rounded-3xl p-5 shadow-sm">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Categories</p>
            <p className="text-2xl font-black text-foreground">{data.categories.length}</p>
          </div>
        </div>
      )}

      {/* Categories Grid - Clean & Simple Redesign */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-card rounded-3xl border border-border" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.categories.map((item) => {
            const Icon = getCategoryIcon(item.category);
            const color = getCategoryColor(item.category);
            const hasBudget = item.budget !== null && item.budget > 0;

            return (
              <div
                key={item.category}
                onClick={() => handleOpenBudgetModal(item.category, item.budget)}
                className={cn(
                  "p-6 rounded-3xl border transition-all cursor-pointer group flex flex-col justify-between relative bg-card hover:shadow-lg hover:-translate-y-0.5",
                  item.status === "exceeded"
                    ? "border-rose-500/40 hover:border-rose-500"
                    : item.status === "warning"
                    ? "border-amber-500/40 hover:border-amber-500"
                    : "border-border hover:border-primary/40"
                )}
              >
                <div>
                  {/* Category Header Row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", color.bg, color.text)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate flex items-center gap-1.5">
                          <span>{item.category}</span>
                          {item.status === "exceeded" && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedExceededItem(item);
                                setIsAlertModalOpen(true);
                              }}
                              className="text-rose-500 hover:text-rose-400 p-0.5 transition-transform hover:scale-125 cursor-pointer shrink-0"
                              title="Over budget! Click for details"
                            >
                              <AlertTriangle className="w-4 h-4 text-rose-500 animate-pulse" />
                            </button>
                          )}
                        </h3>
                        <span className="text-[11px] text-muted-foreground">
                          {hasBudget ? `${item.percentage}% used` : "No limit set"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === "exceeded" && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                          Over Limit
                        </span>
                      )}
                      {hasBudget && (
                        <div
                          className="p-2 rounded-xl text-muted-foreground group-hover:text-foreground bg-secondary/80 hover:bg-secondary transition-all"
                          title="Edit budget"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Main Amount Display: Spent / Budget */}
                  <div className="mt-2 mb-5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-foreground tracking-tight">
                        {formatCurrency(item.spent)}
                      </span>
                      {hasBudget && (
                        <span className="text-xs font-semibold text-muted-foreground">
                          / {formatCurrency(item.budget!)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Status Footer */}
                {hasBudget ? (
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
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
                    <div className="flex justify-between items-center text-xs">
                      <span
                        className={cn(
                          "font-semibold",
                          item.status === "exceeded"
                            ? "text-rose-500"
                            : "text-muted-foreground"
                        )}
                      >
                        {item.remaining !== null && item.remaining >= 0
                          ? `${formatCurrency(item.remaining)} left`
                          : `${formatCurrency(Math.abs(item.remaining || 0))} over budget`}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        Target: {formatCurrency(item.budget!)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 border-t border-border/40 text-xs text-muted-foreground flex items-center justify-between">
                    <span>Track monthly target</span>
                    <span className="text-primary font-bold text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      Set Budget <Pencil className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Budget Modal */}
      <Modal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        title={`Set Budget: ${editingCategory}`}
      >
        <form onSubmit={handleSaveBudget} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Monthly Budget for {monthName}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground font-bold text-xl">
                ₹
              </span>
              <input
                type="number"
                step="50"
                min="0"
                required
                autoFocus
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="e.g. 2000"
                className="w-full bg-secondary border border-border text-foreground rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-2xl"
              />
            </div>
          </div>

          <div>
            <span className="text-xs text-muted-foreground font-semibold block mb-2">Quick Presets:</span>
            <div className="flex flex-wrap gap-2">
              {[1000, 2000, 3000, 5000, 10000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBudgetInput(preset.toString())}
                  className="px-3.5 py-2 bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  ₹{preset >= 1000 ? `${preset / 1000}k` : preset}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={savingBudget}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 text-sm cursor-pointer"
          >
            {savingBudget ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Budget"}
          </button>
        </form>
      </Modal>

      {/* Add Custom Category Modal */}
      <Modal
        isOpen={isNewCategoryModalOpen}
        onClose={() => setIsNewCategoryModalOpen(false)}
        title="Add Custom Category"
      >
        <form onSubmit={handleCreateCategory} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Category Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Subscription, Gym, Investments"
              className="w-full bg-secondary border border-border text-foreground rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Initial Monthly Budget (Optional)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground font-bold text-base">
                ₹
              </span>
              <input
                type="number"
                step="50"
                min="0"
                value={newCategoryBudget}
                onChange={(e) => setNewCategoryBudget(e.target.value)}
                placeholder="Leave blank or enter amount"
                className="w-full bg-secondary border border-border text-foreground rounded-2xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingCategory}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 text-sm cursor-pointer"
          >
            {savingCategory ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Category"}
          </button>
        </form>
      </Modal>

      {/* Budget Exceeded Alert Modal */}
      <BudgetExceededModal
        isOpen={isAlertModalOpen}
        onClose={() => {
          setIsAlertModalOpen(false);
          setSelectedExceededItem(null);
        }}
        exceededCategories={
          selectedExceededItem
            ? [selectedExceededItem]
            : exceededList
        }
      />
    </div>
  );
}
