"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Modal from "@/components/ui/Modal";
import { Loader2, PiggyBank, CreditCard, Sparkles, Sliders, Calendar, Zap } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount?: number;
  category: string;
  type: "SAVINGS" | "DEBT";
  deadline?: string | null;
  status?: string;
}

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialGoal?: Goal | null;
}

const DEFAULT_CATEGORIES = [
  "Shopping",
  "Savings",
  "Debt & Loans",
  "Electronics",
  "Bills & Utilities",
  "Travel",
  "Vehicle",
  "Health",
  "Entertainment",
  "Education",
  "Other",
];

export default function AddGoalModal({
  isOpen,
  onClose,
  onSuccess,
  initialGoal,
}: AddGoalModalProps) {
  const isEditing = Boolean(initialGoal);

  const [type, setType] = useState<"SAVINGS" | "DEBT">("SAVINGS");
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialAmount, setInitialAmount] = useState("");
  const [category, setCategory] = useState("Shopping");
  const [customCategory, setCustomCategory] = useState("");
  const [deadline, setDeadline] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [simulatedMonthly, setSimulatedMonthly] = useState<number>(5000);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setNow(Date.now());
  }, [isOpen]);

  // Compute remaining balance to forecast
  const targetVal = parseFloat(targetAmount) || 0;
  const currentVal = isEditing ? (initialGoal?.currentAmount || 0) : (parseFloat(initialAmount) || 0);
  const remainingVal = Math.max(0, targetVal - currentVal);

  // Dynamic slider range
  const minSliderMonthly = useMemo(() => {
    if (remainingVal <= 0) return 500;
    return Math.max(500, Math.round(remainingVal / 48 / 100) * 100);
  }, [remainingVal]);

  const maxSliderMonthly = useMemo(() => {
    if (remainingVal <= 0) return 25000;
    return Math.max(minSliderMonthly * 3, Math.min(100000, Math.round(remainingVal / 2 / 500) * 500));
  }, [remainingVal, minSliderMonthly]);

  const sliderStep = useMemo(() => {
    if (maxSliderMonthly - minSliderMonthly > 20000) return 1000;
    if (maxSliderMonthly - minSliderMonthly > 5000) return 500;
    return 100;
  }, [minSliderMonthly, maxSliderMonthly]);

  // Sync default simulated pace when goal target changes
  useEffect(() => {
    if (remainingVal > 0) {
      const defaultPace = Math.max(
        minSliderMonthly,
        Math.min(maxSliderMonthly, Math.round(remainingVal / 12 / 500) * 500 || 2500)
      );
      setSimulatedMonthly(defaultPace);
    }
  }, [remainingVal, minSliderMonthly, maxSliderMonthly]);

  useEffect(() => {
    if (initialGoal) {
      setType(initialGoal.type);
      setTitle(initialGoal.title);
      setTargetAmount(initialGoal.targetAmount.toString());
      if (DEFAULT_CATEGORIES.includes(initialGoal.category)) {
        setCategory(initialGoal.category);
        setCustomCategory("");
      } else {
        setCategory("Custom");
        setCustomCategory(initialGoal.category);
      }
      setDeadline(initialGoal.deadline ? initialGoal.deadline.slice(0, 10) : "");
    } else {
      setType("SAVINGS");
      setTitle("");
      setTargetAmount("");
      setInitialAmount("");
      setCategory("Shopping");
      setCustomCategory("");
      setDeadline("");
      setNote("");
    }
  }, [initialGoal, isOpen]);

  // Quick Preset Chips for interactive simulation
  const presetChips = useMemo(() => {
    if (remainingVal <= 0) return [1000, 2500, 5000, 10000];
    const p1 = Math.max(minSliderMonthly, Math.round(remainingVal / 24 / 500) * 500 || 1000);
    const p2 = Math.max(minSliderMonthly, Math.round(remainingVal / 12 / 500) * 500 || 2500);
    const p3 = Math.max(minSliderMonthly, Math.round(remainingVal / 6 / 500) * 500 || 5000);
    const p4 = Math.min(maxSliderMonthly, Math.round(remainingVal / 3 / 500) * 500 || 10000);
    return Array.from(new Set([p1, p2, p3, p4])).sort((a, b) => a - b);
  }, [remainingVal, minSliderMonthly, maxSliderMonthly]);

  // Interactive What-If Simulation Projection
  const whatIfForecast = useMemo(() => {
    if (remainingVal <= 0 || simulatedMonthly <= 0 || !now) return null;

    const monthsNeeded = remainingVal / simulatedMonthly;
    const daysNeeded = Math.round(monthsNeeded * 30.4);
    const estDate = new Date(now + daysNeeded * 24 * 60 * 60 * 1000);
    const dateStr = estDate.toISOString().slice(0, 10);

    let comparison = null;
    if (deadline) {
      const manualTime = new Date(deadline).getTime();
      const timeDiffDays = Math.round((manualTime - estDate.getTime()) / (1000 * 60 * 60 * 24));
      const monthsDiff = Math.round((Math.abs(timeDiffDays) / 30.4) * 10) / 10;
      comparison = {
        timeDiffDays,
        monthsDiff,
        isFaster: timeDiffDays > 5,
        isSlower: timeDiffDays < -5,
      };
    }

    return {
      monthsNeeded: Math.round(monthsNeeded * 10) / 10,
      daysNeeded,
      estDate,
      dateStr,
      comparison,
    };
  }, [remainingVal, simulatedMonthly, now, deadline]);

  // When type changes on a new goal, switch default category appropriately
  const handleTypeChange = (newType: "SAVINGS" | "DEBT") => {
    setType(newType);
    if (!isEditing) {
      if (newType === "DEBT") {
        setCategory("Debt & Loans");
      } else {
        setCategory("Shopping");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      toast.error("Please enter a goal title");
      return;
    }

    const targetVal = parseFloat(targetAmount);
    if (isNaN(targetVal) || targetVal <= 0) {
      toast.error("Target amount must be greater than 0");
      return;
    }

    const effectiveCategory = category === "Custom" ? customCategory.trim() : category;
    if (!effectiveCategory) {
      toast.error("Please specify a category");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && initialGoal) {
        await axios.patch(`/api/goals/${initialGoal.id}`, {
          title: cleanTitle,
          targetAmount: targetVal,
          category: effectiveCategory,
          type,
          deadline: deadline ? new Date(deadline).toISOString() : null,
        });
        toast.success(`Goal "${cleanTitle}" updated!`);
      } else {
        const initVal = initialAmount ? parseFloat(initialAmount) : 0;
        await axios.post("/api/goals", {
          title: cleanTitle,
          targetAmount: targetVal,
          initialAmount: initVal > 0 ? initVal : 0,
          category: effectiveCategory,
          type,
          deadline: deadline ? new Date(deadline).toISOString() : null,
          note: note.trim() || undefined,
        });
        toast.success(`Goal "${cleanTitle}" created!`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save goal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Financial Goal" : "Create New Financial Goal"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Goal Type Switcher */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Goal Purpose
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange("SAVINGS")}
              className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                type === "SAVINGS"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-500 shadow-sm font-bold ring-2 ring-emerald-500/20"
                  : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <PiggyBank className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs font-bold">Savings & Purchase</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">e.g. Smartphone, Bike, Vacation</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTypeChange("DEBT")}
              className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                type === "DEBT"
                  ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-600 dark:text-cyan-400 shadow-sm font-bold ring-2 ring-cyan-500/20"
                  : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-xs font-bold">Debt & Loan Payoff</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">e.g. Personal loan, Credit card</p>
              </div>
            </button>
          </div>
        </div>

        {/* Goal Title */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Goal Title / Name
          </label>
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              type === "SAVINGS"
                ? "e.g. New iPhone 16, MacBook Pro, Goa Trip"
                : "e.g. HDFC Personal Loan, Education Loan, Bike EMI"
            }
            className="w-full bg-secondary border border-border text-foreground rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
          />
        </div>

        {/* Target Amount */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            {type === "DEBT" ? "Total Loan / Debt Amount (₹)" : "Target Goal Amount (₹)"}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground font-bold text-xl">
              ₹
            </span>
            <input
              type="number"
              step="1"
              min="1"
              required
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="e.g. 75000"
              className="w-full bg-secondary border border-border text-foreground rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-xl"
            />
          </div>
        </div>

        {/* Initial Amount (Only when creating) */}
        {!isEditing && (
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              {type === "DEBT" ? "Amount Already Paid Out (Optional)" : "Already Saved So Far (Optional)"}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground font-bold text-base">
                ₹
              </span>
              <input
                type="number"
                step="1"
                min="0"
                value={initialAmount}
                onChange={(e) => setInitialAmount(e.target.value)}
                placeholder="0 if starting fresh"
                className="w-full bg-secondary border border-border text-foreground rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-base"
              />
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Enter any initial balance already saved or repaid.
            </p>
          </div>
        )}

        {/* Category Selection */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-secondary border border-border text-foreground rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-bold cursor-pointer"
          >
            {DEFAULT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
            <option value="Custom">+ Other / Custom Category</option>
          </select>

          {category === "Custom" && (
            <input
              type="text"
              required
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Type custom category name..."
              className="mt-2 w-full bg-secondary border border-border text-foreground rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
            />
          )}
        </div>

        {/* Target Completion Date (Optional) */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Target Completion Date (Optional)
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-secondary border border-border text-foreground rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
          />
        </div>

        {/* Interactive Savings Goal "What-If" Pace Simulator Card */}
        {remainingVal > 0 && whatIfForecast && (
          <div className="p-4 sm:p-5 rounded-3xl bg-secondary/40 border border-primary/20 space-y-4 animate-in fade-in-50 duration-200">
            {/* Header & Speed Badge */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">
                    Savings Pace &ldquo;What-If&rdquo; Simulator
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Slide to test different monthly contributions
                  </p>
                </div>
              </div>
              <span className="text-xs sm:text-sm font-black text-primary font-mono bg-primary/10 px-2.5 py-1 rounded-xl border border-primary/20 shrink-0">
                {formatCurrency(simulatedMonthly)} / mo
              </span>
            </div>

            {/* Range Slider */}
            <div className="space-y-1.5">
              <input
                type="range"
                min={minSliderMonthly}
                max={maxSliderMonthly}
                step={sliderStep}
                value={simulatedMonthly}
                onChange={(e) => setSimulatedMonthly(Number(e.target.value))}
                className="w-full accent-primary h-2 bg-secondary rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                <span>Min: {formatCurrency(minSliderMonthly)}/mo</span>
                <span>Max: {formatCurrency(maxSliderMonthly)}/mo</span>
              </div>
            </div>

            {/* Quick Preset Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase mr-1">
                Presets:
              </span>
              {presetChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setSimulatedMonthly(chip)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    simulatedMonthly === chip
                      ? "bg-primary text-primary-foreground font-bold shadow-xs"
                      : "bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                  }`}
                >
                  {formatCurrency(chip)}
                </button>
              ))}
            </div>

            {/* Live Projected Completion Date Card */}
            <div className="p-3.5 rounded-2xl bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>Projected Completion: {formatDate(whatIfForecast.dateStr)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Reaches {formatCurrency(remainingVal)} goal in ~{whatIfForecast.monthsNeeded} months ({whatIfForecast.daysNeeded} days)
                </p>

                {/* Comparison with manual deadline if set */}
                {whatIfForecast.comparison?.isFaster && (
                  <p className="text-[11px] font-bold text-emerald-500 pt-0.5">
                    🎉 Finishes {whatIfForecast.comparison.monthsDiff} months earlier (~{whatIfForecast.comparison.timeDiffDays} days saved)!
                  </p>
                )}
                {whatIfForecast.comparison?.isSlower && (
                  <p className="text-[11px] font-bold text-amber-500 pt-0.5">
                    ⚠️ At this pace, you will finish {whatIfForecast.comparison.monthsDiff} months after your target date.
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setDeadline(whatIfForecast.dateStr);
                  toast.success(`Target date applied: ${formatDate(whatIfForecast.dateStr)}!`);
                }}
                className="shrink-0 inline-flex items-center justify-center gap-1.5 bg-secondary hover:bg-secondary/80 border border-primary/30 text-foreground hover:text-primary font-bold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span>Apply Date</span>
              </button>
            </div>
          </div>
        )}

        {/* Initial Note (Optional, only for new goal with initial amount) */}
        {!isEditing && initialAmount && parseFloat(initialAmount) > 0 && (
          <div>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Note for Initial Balance
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Existing savings in account, 2 instalments already paid"
              className="w-full bg-secondary border border-border text-foreground rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 text-sm cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {isEditing ? "Save Changes" : "Create Goal"}
            </>
          )}
        </button>
      </form>
    </Modal>
  );
}
