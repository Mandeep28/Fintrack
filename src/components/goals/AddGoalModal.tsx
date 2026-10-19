"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "@/components/ui/Modal";
import { Loader2, PiggyBank, CreditCard, Sparkles } from "lucide-react";
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
                  ? "bg-violet-500/10 border-violet-500/40 text-violet-500 shadow-sm font-bold ring-2 ring-violet-500/20"
                  : "bg-secondary/40 border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-violet-500" />
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

        {/* Target Deadline (Optional) */}
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
