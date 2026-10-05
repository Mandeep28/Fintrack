"use client";

import { useState, useMemo } from "react";
import axios from "axios";
import { 
  Sparkles, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ListPlus,
  HelpCircle
} from "lucide-react";
import { BROAD_CATEGORIES, parseBulkText, ParsedExpense, detectCategory } from "@/lib/categorizer";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface BulkExpenseFormProps {
  onSuccess: () => void;
  roomId?: string | null;
}

export default function BulkExpenseForm({ onSuccess, roomId }: BulkExpenseFormProps) {
  const [rawText, setRawText] = useState("");
  const [parsedItems, setParsedItems] = useState<ParsedExpense[]>([]);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleParse = () => {
    if (!rawText.trim()) return;
    const items = parseBulkText(rawText);
    if (items.length === 0) {
      setError("Could not parse any expenses. Please check format (e.g. '20 sept 250 dinner')");
      return;
    }
    setError("");
    setParsedItems(items);
    setIsEditingMode(true);
  };

  const handleUpdateItem = (index: number, updates: Partial<ParsedExpense>) => {
    setParsedItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      // If note changed and category wasn't explicitly changed, re-detect
      if (updates.note && !updates.category) {
        copy[index].category = detectCategory(updates.note);
      }
      return copy;
    });
  };

  const handleDeleteItem = (index: number) => {
    setParsedItems((prev) => prev.filter((_, i) => i !== index));
    if (parsedItems.length <= 1) {
      setIsEditingMode(false);
    }
  };

  const totalAmount = useMemo(() => {
    return parsedItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [parsedItems]);

  const handleSubmit = async () => {
    if (parsedItems.length === 0) return;
    setLoading(true);
    setError("");

    try {
      await axios.post("/api/expenses/bulk", {
        expenses: parsedItems.map((item) => ({
          amount: Number(item.amount),
          category: item.category,
          note: item.note,
          date: item.date,
          roomId: roomId || null,
        })),
      });

      toast.success(`Successfully saved ${parsedItems.length} expenses!`);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save expenses");
      setLoading(false);
    }
  };

  const exampleText = `20 sept 250 dinner\n20 sept 58 rapido\nyesterday 1200 dmart\ntrain ticket 450\n80 chai`;

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!isEditingMode ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-slate-300 text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Paste One-Liners (One per line)
            </label>
            <button
              type="button"
              onClick={() => setRawText(exampleText)}
              className="text-xs text-blue-400 hover:text-blue-300 underline font-medium flex items-center gap-1"
            >
              Fill Example
            </button>
          </div>

          <textarea
            rows={7}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`Type or paste your expenses, for example:\n20 sept 250 dinner\n20 sept 58 rapido\nyesterday 1200 dmart\ntrain ticket 450\n80 chai`}
            className="w-full bg-secondary/50 border border-border rounded-2xl p-4 text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground resize-y"
          />

          <div className="p-3 bg-secondary/40 border border-border rounded-2xl flex items-start gap-2.5 text-xs text-muted-foreground">
            <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground mb-0.5">Format Tips:</p>
              <p>Works in any order: <code className="text-primary font-bold">Date Amount Note</code> or <code className="text-primary font-bold">Note Amount</code>. Dates can be <code className="text-primary font-bold">yesterday</code>, <code className="text-primary font-bold">20 sept</code>, <code className="text-primary font-bold">20/09</code>, or left blank to default to today.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleParse}
            disabled={!rawText.trim()}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-bold py-3.5 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Parse & Review Expenses
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-secondary/40 p-3.5 rounded-2xl border border-border">
            <div>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block">Total Parsed</span>
              <span className="text-lg font-black text-foreground">{parsedItems.length} expenses ({formatCurrency(totalAmount)})</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingMode(false)}
              className="text-xs text-primary hover:underline font-bold cursor-pointer"
            >
              ← Edit Raw Text
            </button>
          </div>

          {/* Review Table / List */}
          <div className="max-h-[350px] overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {parsedItems.map((item, index) => (
              <div
                key={index}
                className="p-3 bg-card border border-border rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 hover:border-primary/40 transition-all"
              >
                {/* Date */}
                <input
                  type="date"
                  value={item.date}
                  onChange={(e) => handleUpdateItem(index, { date: e.target.value })}
                  className="bg-secondary/60 text-foreground text-xs px-2.5 py-2 rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium shrink-0"
                />

                {/* Note */}
                <input
                  type="text"
                  value={item.note}
                  onChange={(e) => handleUpdateItem(index, { note: e.target.value })}
                  placeholder="Note / Description"
                  className="bg-secondary/60 text-foreground text-xs px-3 py-2 rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium flex-1 min-w-[120px]"
                />

                {/* Amount */}
                <div className="relative shrink-0 w-28">
                  <span className="absolute left-2.5 top-2 text-muted-foreground text-xs font-bold">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    value={item.amount}
                    onChange={(e) => handleUpdateItem(index, { amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-secondary/60 text-foreground text-xs pl-6 pr-2.5 py-2 rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary font-bold"
                  />
                </div>

                {/* Category Select */}
                <select
                  value={item.category}
                  onChange={(e) => handleUpdateItem(index, { category: e.target.value as any })}
                  className="bg-secondary/60 text-foreground text-xs px-2.5 py-2 rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary font-semibold shrink-0 cursor-pointer"
                >
                  {BROAD_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleDeleteItem(index)}
                  className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all self-center sm:self-auto shrink-0 cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={loading || parsedItems.length === 0}
            onClick={handleSubmit}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm mt-4 active:scale-[0.99] cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Save All {parsedItems.length} Expenses ({formatCurrency(totalAmount)})
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
