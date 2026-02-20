"use client";

import { useState } from "react";
import axios from "axios";
import { Loader2, DollarSign, Tag, FileText, Calendar as CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddExpenseFormProps {
  roomId?: string | null;
  onSuccess: () => void;
  initialData?: any;
}

export default function AddExpenseForm({ roomId, onSuccess, initialData }: AddExpenseFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    amount: initialData?.amount?.toString() || "",
    category: initialData?.category || "",
    note: initialData?.note || "",
    date: initialData?.date ? new Date(initialData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    roomId: initialData?.roomId || roomId || null,
  });

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <DollarSign className="w-5 h-5 text-slate-500" />
          </div>
          <input
            type="number"
            step="0.01"
            required
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl pl-11 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold text-xl"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <Tag className="w-5 h-5 text-slate-500" />
          </div>
          <Select 
            value={formData.category} 
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger className="pl-11">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {["Food", "Groceries", "Café", "Rent", "Utilities", "Shopping", "Transport", "Fuel", "Entertainment", "Health", "Other"].map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <CalendarIcon className="w-5 h-5 text-slate-500" />
          </div>
          <input
            type="date"
            required
            min={roomId ? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0] : undefined}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl pl-11 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div className="relative">
           <div className="absolute top-4 left-4 pointer-events-none">
            <FileText className="w-5 h-5 text-slate-500" />
          </div>
          <textarea
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-2xl pl-11 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[100px]"
            placeholder="Add a note (optional)"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-4"
      >
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : initialData ? "Update Expense" : "Save Expense"}
      </button>
    </form>
  );
}
