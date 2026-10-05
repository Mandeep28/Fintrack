"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { 
  ArrowLeft, 
  Activity, 
  Trash2, 
  Pencil, 
  Search, 
  Calendar,
  Loader2,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
} from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { getCategoryIcon, getCategoryColor } from "@/lib/icons";
import Modal from "@/components/ui/Modal";
import AddExpenseForm from "@/components/forms/AddExpenseForm";
import { toast } from "sonner";

const MONTH_OPTIONS = [
  { value: "all", label: "All Months" },
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
const YEAR_OPTIONS = [
  { value: "all", label: "All Years" },
  ...Array.from({ length: 6 }, (_, i) => {
    const y = currentYear - i;
    return { value: y.toString(), label: y.toString() };
  }),
];

export default function ActivityPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFilteredAmount, setTotalFilteredAmount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 20;

  // Filters: Separate Year & Month (Defaults to Current Year & Current Month)
  const today = new Date();
  const currentYearStr = today.getFullYear().toString();
  const currentMonthStr = String(today.getMonth() + 1).padStart(2, "0");

  const [selectedYear, setSelectedYear] = useState<string>(currentYearStr);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const isFiltered =
    selectedYear !== currentYearStr ||
    selectedMonth !== currentMonthStr ||
    selectedCategory !== "All" ||
    searchQuery.trim() !== "";

  const handleResetFilters = () => {
    setSelectedYear(currentYearStr);
    setSelectedMonth(currentMonthStr);
    setSelectedCategory("All");
    setSearchQuery("");
    setPage(1);
  };

  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // reset to page 1 on search change
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (selectedYear && selectedYear !== "all") {
        params.append("year", selectedYear);
      }
      if (selectedMonth && selectedMonth !== "all") {
        params.append("month", selectedMonth);
      }
      if (selectedCategory && selectedCategory !== "All") {
        params.append("category", selectedCategory);
      }
      if (debouncedSearch && debouncedSearch.trim() !== "") {
        params.append("search", debouncedSearch.trim());
      }

      const res = await axios.get(`/api/expenses?${params.toString()}`);
      if (res.data && res.data.expenses) {
        setExpenses(res.data.expenses);
        setTotalCount(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
        setTotalFilteredAmount(res.data.totalAmount || 0);
        if (res.data.categories && res.data.categories.length > 0) {
          setCategoriesList(["All", ...res.data.categories]);
        }
      } else if (Array.isArray(res.data)) {
        setExpenses(res.data);
        setTotalCount(res.data.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [page, selectedYear, selectedMonth, selectedCategory, debouncedSearch]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const deleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await axios.delete(`/api/expenses/${id}`);
      toast.success("Expense deleted successfully");
      fetchExpenses();
    } catch (err) {
      toast.error("Failed to delete expense");
    }
  };

  const openEditModal = (expense: any) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleYearChange = (val: string) => {
    setSelectedYear(val);
    setPage(1);
  };

  const handleMonthChange = (val: string) => {
    setSelectedMonth(val);
    setPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setPage(1);
  };

  const startRecord = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalCount);

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
              <Activity className="w-6 h-6" />
            </span>
            All Activity & Transactions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse, search, and manage your complete transaction history.
          </p>
        </div>

        <div className="bg-card border border-border px-5 py-3 rounded-2xl flex items-center gap-4 shadow-sm self-start sm:self-auto">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Records</p>
            <p className="text-lg font-black text-foreground">{totalCount}</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Spent</p>
            <p className="text-lg font-black text-primary">{formatCurrency(totalFilteredAmount)}</p>
          </div>
        </div>
      </div>

      {/* Filters Bar: Search + Year + Month + Category + Reset */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="relative sm:col-span-2 lg:col-span-4">
          <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by note, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border text-foreground text-sm rounded-2xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium placeholder:text-muted-foreground"
          />
        </div>

        {/* Year Selector */}
        <div className="relative sm:col-span-1 lg:col-span-2">
          <select
            value={selectedYear}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-full bg-card border border-border text-foreground text-sm rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-semibold cursor-pointer appearance-none truncate"
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>
        </div>

        {/* Month Selector */}
        <div className="relative sm:col-span-1 lg:col-span-2">
          <Calendar className="w-4 h-4 text-muted-foreground absolute left-4 top-3.5 pointer-events-none" />
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-full bg-card border border-border text-foreground text-sm rounded-2xl pl-11 pr-8 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-semibold cursor-pointer appearance-none truncate"
          >
            {MONTH_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Selector (All Broad + Custom + Expenses) */}
        <div className="relative sm:col-span-1 lg:col-span-3">
          <Filter className="w-4 h-4 text-muted-foreground absolute left-4 top-3.5 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full bg-card border border-border text-foreground text-sm rounded-2xl pl-11 pr-8 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 font-semibold cursor-pointer appearance-none truncate"
          >
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filters Button */}
        <div className="sm:col-span-1 lg:col-span-1">
          <button
            type="button"
            onClick={handleResetFilters}
            disabled={!isFiltered}
            title={isFiltered ? "Reset to current month defaults" : "Filters at default"}
            className={cn(
              "w-full flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer",
              isFiltered
                ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 shadow-sm"
                : "bg-card border-border text-muted-foreground/40 cursor-not-allowed opacity-60"
            )}
          >
            <RotateCcw className="w-4 h-4 shrink-0" />
            <span className="lg:hidden xl:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="font-semibold text-sm">Loading transactions...</span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-16 text-center">
            <FileSpreadsheet className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-base font-bold text-foreground">No transactions found</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Try adjusting your year, month, category, or search filters.
            </p>
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/40 border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Date</th>
                  <th className="p-4">Description / Note</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-right">Amount</th>
                  <th className="p-4 pr-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenses.map((exp) => {
                  const Icon = getCategoryIcon(exp.category);
                  const color = getCategoryColor(exp.category);

                  return (
                    <tr key={exp.id} className="hover:bg-secondary/20 transition-colors group">
                      <td className="p-4 pl-6 text-xs text-muted-foreground font-medium whitespace-nowrap">
                        {formatDate(exp.date)}
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        {exp.note || <span className="text-muted-foreground italic font-normal">No note</span>}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${color.bg} ${color.text} border ${color.border}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-4 text-right font-black text-sm text-foreground whitespace-nowrap">
                        -{formatCurrency(exp.amount)}
                      </td>
                      <td className="p-4 pr-6 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Server Pagination Footer */}
        {totalCount > 0 && (
          <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-secondary/10">
            <p className="text-xs text-muted-foreground font-medium">
              Showing <span className="font-bold text-foreground">{startRecord}</span> to{" "}
              <span className="font-bold text-foreground">{endRecord}</span> of{" "}
              <span className="font-bold text-foreground">{totalCount}</span> transactions
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                className="p-2 bg-secondary hover:bg-secondary/80 disabled:opacity-40 text-foreground rounded-xl border border-border transition-all cursor-pointer flex items-center justify-center disabled:cursor-not-allowed"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold text-foreground px-3 py-1.5 bg-secondary rounded-xl border border-border">
                {page} / {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="p-2 bg-secondary hover:bg-secondary/80 disabled:opacity-40 text-foreground rounded-xl border border-border transition-all cursor-pointer flex items-center justify-center disabled:cursor-not-allowed"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }}
        title="Edit Expense"
      >
        <AddExpenseForm
          initialData={editingExpense}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingExpense(null);
            fetchExpenses();
          }}
        />
      </Modal>
    </div>
  );
}
