"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { 
  ArrowLeft, 
  Sparkles, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  FileSpreadsheet,
  Plus
} from "lucide-react";
import { BROAD_CATEGORIES, parseBulkText, ParsedExpense, detectCategory } from "@/lib/categorizer";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function QuickAddExpensePage() {
  const router = useRouter();
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

  const handleAddNewRow = () => {
    const today = new Date().toISOString().split("T")[0];
    setParsedItems((prev) => [
      ...prev,
      {
        date: today,
        note: "",
        amount: 0,
        category: "Other",
        raw: "",
      },
    ]);
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
          roomId: null,
        })),
      });

      toast.success(`Successfully saved ${parsedItems.length} expenses!`);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save expenses");
      setLoading(false);
    }
  };

  const sampleEntries = `20 sept 250 dinner\n20 sept 58 rapido\nyesterday 1200 dmart groceries\ntrain ticket 450\n80 chai and bun maska\n1.5k shoes amazon`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <span className="p-2.5 bg-blue-600/10 border border-blue-500/20 text-blue-500 rounded-2xl">
              <Sparkles className="w-6 h-6" />
            </span>
            Quick One-Liner Entry
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dump your weekly or monthly UPI spends in plain text — FinTrack will extract the dates, amounts, and categories automatically.
          </p>
        </div>

        {isEditingMode && (
          <div className="flex items-center gap-4 bg-secondary/50 border border-border px-5 py-3 rounded-2xl">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Items</p>
              <p className="text-lg font-black text-foreground">{parsedItems.length}</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Sum</p>
              <p className="text-lg font-black text-primary">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-2xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input or Review mode */}
      {!isEditingMode ? (
        <div className="bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-primary" />
              Enter Transactions (One per line)
            </label>
            <button
              type="button"
              onClick={() => setRawText(sampleEntries)}
              className="text-xs text-primary hover:underline font-bold"
            >
              Fill Sample Data
            </button>
          </div>

          <textarea
            rows={10}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder={`Type or paste your expenses here, e.g.:\n20 sept 250 dinner\n20 sept 58 rapido\nyesterday 1200 dmart groceries\ntrain ticket 450\n80 chai\n1.5k shoes`}
            className="w-full bg-secondary/30 border border-border rounded-2xl p-5 text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/60 resize-y leading-relaxed"
          />

          {/* Quick Tip Box */}
          <div className="bg-secondary/40 border border-border rounded-2xl p-4 flex items-start gap-3 text-xs text-muted-foreground">
            <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-foreground">How it works:</p>
              <p>
                You can write in any natural order: <span className="text-primary font-mono">20 sept 250 dinner</span>, <span className="text-primary font-mono">rapido 58 yesterday</span>, or just <span className="text-primary font-mono">120 coffee</span>.
              </p>
              <p>
                Supports shortcuts like <span className="text-primary font-mono">1.5k</span> (=1500), <span className="text-primary font-mono">yesterday</span>, <span className="text-primary font-mono">today</span>, and automatically recognizes food, travel, groceries, bills, and shopping!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleParse}
            disabled={!rawText.trim()}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4" />
            Parse & Review {rawText.trim() ? `(${rawText.trim().split("\n").filter(Boolean).length} lines)` : ""}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">Review & Edit Parsed Expenses</h2>
              <p className="text-xs text-muted-foreground">Check details before saving. You can adjust categories, dates, or amounts.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddNewRow}
                className="px-3.5 py-2 bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Row
              </button>
              <button
                type="button"
                onClick={() => setIsEditingMode(false)}
                className="text-xs text-primary hover:underline font-bold"
              >
                Edit Raw Text
              </button>
            </div>
          </div>

          {/* Table View */}
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-secondary/50 border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4 w-40">Date</th>
                    <th className="p-4">Description / Note</th>
                    <th className="p-4 w-44">Category</th>
                    <th className="p-4 w-36">Amount</th>
                    <th className="p-4 w-14 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {parsedItems.map((item, index) => (
                    <tr key={index} className="hover:bg-secondary/20 transition-colors">
                      {/* Date */}
                      <td className="p-3">
                        <input
                          type="date"
                          value={item.date}
                          onChange={(e) => handleUpdateItem(index, { date: e.target.value })}
                          className="w-full bg-secondary text-foreground text-xs px-3 py-2 rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                        />
                      </td>

                      {/* Note */}
                      <td className="p-3">
                        <input
                          type="text"
                          value={item.note}
                          onChange={(e) => handleUpdateItem(index, { note: e.target.value })}
                          placeholder="Description"
                          className="w-full bg-secondary text-foreground text-xs px-3 py-2 rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                        />
                      </td>

                      {/* Category */}
                      <td className="p-3">
                        <select
                          value={item.category}
                          onChange={(e) => handleUpdateItem(index, { category: e.target.value as any })}
                          className="w-full bg-secondary text-foreground text-xs px-3 py-2 rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary font-semibold cursor-pointer"
                        >
                          {BROAD_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Amount */}
                      <td className="p-3">
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-muted-foreground text-xs font-bold">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            value={item.amount}
                            onChange={(e) => handleUpdateItem(index, { amount: parseFloat(e.target.value) || 0 })}
                            className="w-full bg-secondary text-foreground text-xs pl-7 pr-3 py-2 rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary font-bold text-right"
                          />
                        </div>
                      </td>

                      {/* Delete */}
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(index)}
                          className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                          title="Delete Row"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <Link
              href="/dashboard"
              className="text-xs text-muted-foreground hover:text-foreground font-bold transition-colors"
            >
              Cancel and Discard
            </Link>

            <button
              type="button"
              disabled={loading || parsedItems.length === 0}
              onClick={handleSubmit}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.99]"
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
        </div>
      )}
    </div>
  );
}
