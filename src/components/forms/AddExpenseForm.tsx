"use client";

import { useState } from "react";
import axios from "axios";
import { Loader2, Tag, FileText, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BROAD_CATEGORIES, detectCategory } from "@/lib/categorizer";
import { getCategoryColor } from "@/lib/icons";

interface AddExpenseFormProps {
  roomId?: string | null;
  onSuccess: () => void;
  initialData?: any;
}

export default function AddExpenseForm({ roomId, onSuccess, initialData }: AddExpenseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isManualCategory, setIsManualCategory] = useState(Boolean(initialData?.category));
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: initialData?.amount?.toString() || "",
    note: initialData?.note || "",
    category: initialData?.category || "Other",
    date: initialData?.date
      ? new Date(initialData.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    roomId: initialData?.roomId || roomId || null,
  });

  const handleNoteChange = (newNote: string) => {
    setFormData((prev) => {
      // Auto-detect category if user hasn't explicitly picked one manually
      if (!isManualCategory) {
        const detected = detectCategory(newNote);
        setDetectedCategory(detected !== "Other" ? detected : null);
        return { ...prev, note: newNote, category: detected };
      }
      return { ...prev, note: newNote };
    });
  };

  const handleCategoryChange = (selected: string) => {
    setIsManualCategory(true);
    setDetectedCategory(null);
    setFormData((prev) => ({ ...prev, category: selected }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (initialData?.id) {
        await axios.patch(`/api/expenses/${initialData.id}`, {
          ...formData,
          amount: parseFloat(formData.amount),
        });
      } else {
        await axios.post("/api/expenses", {
          ...formData,
          amount: parseFloat(formData.amount),
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* 1. Amount */}
        <div>
          <label className="block text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground font-bold text-xl">
              ₹
            </div>
            <input
              type="number"
              step="0.01"
              required
              autoFocus
              className="w-full bg-secondary/50 border border-border text-foreground rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold text-2xl placeholder:text-muted-foreground"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>
        </div>

        {/* 2. Note / Description (Triggers Auto-Category Detection) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-muted-foreground text-xs font-bold uppercase tracking-wider">
              Note / Description
            </label>
            {detectedCategory && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-fade-in">
                <Sparkles className="w-3 h-3" /> Auto-detected: {detectedCategory}
              </span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              className="w-full bg-secondary/50 border border-border text-foreground rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-muted-foreground"
              placeholder="e.g. train ticket, dinner, rapido, grocery"
              value={formData.note}
              onChange={(e) => handleNoteChange(e.target.value)}
            />
          </div>
        </div>

        {/* 3. Category (Auto-selected, with manual override) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-muted-foreground text-xs font-bold uppercase tracking-wider">
              Category
            </label>
            {isManualCategory && (
              <button
                type="button"
                onClick={() => {
                  setIsManualCategory(false);
                  const detected = detectCategory(formData.note);
                  setDetectedCategory(detected !== "Other" ? detected : null);
                  setFormData((prev) => ({ ...prev, category: detected }));
                }}
                className="text-[10px] text-primary hover:underline uppercase font-bold cursor-pointer"
              >
                Reset to Auto-detect
              </button>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <Tag className="w-5 h-5 text-muted-foreground" />
            </div>
            <Select value={formData.category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="pl-11 h-12 rounded-2xl bg-secondary/50 border-border text-foreground">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                {BROAD_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="cursor-pointer">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 4. Date (Defaults to today, allows past dates) */}
        <div>
          <label className="block text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">
            Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <CalendarIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <input
              type="date"
              required
              min={
                roomId
                  ? new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                      .toISOString()
                      .split("T")[0]
                  : undefined
              }
              className="w-full bg-secondary/50 border border-border text-foreground rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-6 active:scale-[0.99] cursor-pointer"
      >
        {loading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : initialData ? (
          "Update Expense"
        ) : (
          "Save Expense"
        )}
      </button>
    </form>
  );
}
