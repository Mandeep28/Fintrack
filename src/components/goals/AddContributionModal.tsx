"use client";

import { useState } from "react";
import axios from "axios";
import Modal from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  percentage: number;
  type: "SAVINGS" | "DEBT";
}

interface AddContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  onSuccess: () => void;
}

export default function AddContributionModal({
  isOpen,
  onClose,
  goal,
  onSuccess,
}: AddContributionModalProps) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  if (!goal) return null;

  const isDebt = goal.type === "DEBT";
  const numAmount = parseFloat(amount) || 0;
  const newProgress = Math.min(
    100,
    goal.targetAmount > 0
      ? ((goal.currentAmount + numAmount) / goal.targetAmount) * 100
      : 0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`/api/goals/${goal.id}/contributions`, {
        amount: val,
        note: note.trim() || undefined,
        date: date ? new Date(date).toISOString() : undefined,
      });

      toast.success(
        isDebt
          ? `Payment of ${formatCurrency(val)} recorded for ${goal.title}!`
          : `Added ${formatCurrency(val)} to ${goal.title}!`
      );
      setAmount("");
      setNote("");
      setDate(new Date().toISOString().slice(0, 10));
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add contribution");
    } finally {
      setSubmitting(false);
    }
  };

  const quickPresets = [500, 1000, 2000, 5000];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isDebt ? `Record Loan Payment: ${goal.title}` : `Add Money to: ${goal.title}`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Current status summary card */}
        <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground font-medium">
              {isDebt ? "Total Loan Paid" : "Total Saved So Far"}
            </span>
            <span className="font-bold text-foreground">
              {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
            </span>
          </div>

          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isDebt ? "bg-violet-500" : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(goal.percentage, 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">
              {goal.percentage}% completed
            </span>
            <span className="font-bold text-primary">
              {formatCurrency(goal.remainingAmount)} left
            </span>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            {isDebt ? "Payment Amount (₹)" : "Amount to Add (₹)"}
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
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 2000"
              className="w-full bg-secondary border border-border text-foreground rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-2xl"
            />
          </div>
        </div>

        {/* Quick presets */}
        <div>
          <span className="text-xs text-muted-foreground font-semibold block mb-2">Quick Add:</span>
          <div className="flex flex-wrap gap-2">
            {quickPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className="px-3 py-1.5 bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                +₹{preset >= 1000 ? `${preset / 1000}k` : preset}
              </button>
            ))}
            {goal.remainingAmount > 0 && (
              <button
                type="button"
                onClick={() => setAmount(Math.round(goal.remainingAmount).toString())}
                className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Pay Full Remaining (₹{Math.round(goal.remainingAmount)})
              </button>
            )}
          </div>
        </div>

        {/* Note / Description */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Note / Description (Optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              isDebt
                ? "e.g. October EMI, Extra principal payment"
                : "e.g. Monthly savings, Birthday gift money, Bonus"
            }
            className="w-full bg-secondary border border-border text-foreground rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-secondary border border-border text-foreground rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
          />
        </div>

        {/* Projected completion preview */}
        {numAmount > 0 && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-muted-foreground">New Progress:</span>
            <span className="font-bold text-primary flex items-center gap-1.5">
              <span>{newProgress.toFixed(1)}%</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{formatCurrency(Math.max(0, goal.remainingAmount - numAmount))} left</span>
            </span>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 text-sm cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              {isDebt ? `Record Payment` : `Add Money to Goal`}
            </>
          )}
        </button>
      </form>
    </Modal>
  );
}
