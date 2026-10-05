'use client';

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { 
  TrendingUp, 
  Plus, 
  Activity, 
  ArrowUpRight, 
  PlusCircle, 
  Trash2, 
  Pencil, 
  Sparkles,
  ChevronRight,
  Clock
} from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import AddExpenseForm from "@/components/forms/AddExpenseForm";
import ActiveBudgetsWidget from "@/components/budget/ActiveBudgetsWidget";
import BudgetExceededModal from "@/components/budget/BudgetExceededModal";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from "recharts";
import { getCategoryIcon, getCategoryColor } from "@/lib/icons";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [budgetsData, setBudgetsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Single edit expense modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  // Budget exceeded alert modal
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [activeAlertItem, setActiveAlertItem] = useState<any>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, roomsRes, budgetsRes] = await Promise.all([
        axios.get("/api/expenses"),
        axios.get("/api/rooms"),
        axios.get(`/api/budgets?month=${currentMonth}`)
      ]);
      setExpenses(expensesRes.data);
      setRooms(roomsRes.data);
      setBudgetsData(budgetsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await axios.delete(`/api/expenses/${id}`);
      toast.success("Expense deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete expense");
    }
  };

  const openEditModal = (expense: any) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Current month calculation
  const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const currentMonthExpenses = useMemo(() => {
    return expenses.filter(exp => new Date(exp.date) >= currentMonthStart);
  }, [expenses]);

  const currentMonthSpent = budgetsData?.totalSpent ?? currentMonthExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const currentDay = Math.max(1, new Date().getDate());
  const dailyAverage = currentMonthSpent / currentDay;
  
  // Last 7 days chart data
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(dateStr => {
    const dailyTotal = expenses
      .filter(exp => exp.date.split('T')[0] === dateStr)
      .reduce((sum, exp) => sum + Number(exp.amount), 0);
    
    return {
      name: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
      amount: dailyTotal,
    };
  });

  const prevMonthTotal = currentMonthSpent * 0.9;
  const percentageChange = prevMonthTotal > 0 
    ? ((currentMonthSpent - prevMonthTotal) / prevMonthTotal * 100).toFixed(1)
    : "0";

  // Check exceeded categories
  const exceededCategories = useMemo(() => {
    if (!budgetsData?.categories) return [];
    return budgetsData.categories.filter((c: any) => c.status === "exceeded");
  }, [budgetsData]);

  // Latest 20 transactions for the table
  const latest20Expenses = useMemo(() => {
    return expenses.slice(0, 20);
  }, [expenses]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Hello, {session?.user?.name || "User"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your money this month.</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/expenses/quick-add"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 border border-border text-primary hover:text-foreground px-5 py-3.5 rounded-2xl font-bold transition-all text-sm shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            Quick One-Liner (Bulk)
          </Link>
          <button 
            onClick={() => {
              setEditingExpense(null);
              setIsModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-3.5 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all text-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Modal: Single Add / Edit Expense */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingExpense(null);
        }} 
        title={editingExpense ? "Edit Expense" : "Add New Expense"}
      >
        <AddExpenseForm 
          initialData={editingExpense}
          onSuccess={() => {
            setIsModalOpen(false);
            setEditingExpense(null);
            fetchData();
          }} 
        />
      </Modal>

      {/* Modal: Exceeded Budgets Alert Breakdown */}
      <BudgetExceededModal
        isOpen={isAlertModalOpen}
        onClose={() => {
          setIsAlertModalOpen(false);
          setActiveAlertItem(null);
        }}
        exceededCategories={
          activeAlertItem
            ? [activeAlertItem]
            : exceededCategories
        }
      />

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden group transition-all hover:border-primary/40">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-primary" />
          </div>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Total Spent (This Month)</p>
          <h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">{formatCurrency(currentMonthSpent)}</h3>
          <div className={cn(
            "flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl w-fit",
            Number(percentageChange) >= 0 ? "text-rose-400 bg-rose-400/10" : "text-emerald-400 bg-emerald-400/10"
          )}>
            <ArrowUpRight className={cn("w-3.5 h-3.5", Number(percentageChange) < 0 && "rotate-90")} />
            {Math.abs(Number(percentageChange))}% {Number(percentageChange) >= 0 ? "vs avg" : "saved"}
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden group transition-all hover:border-primary/40">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
            <Activity className="w-16 h-16 text-primary" />
          </div>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Daily Average</p>
          <h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">{formatCurrency(dailyAverage)}</h3>
          <div className="flex items-center gap-2 text-primary text-xs font-bold bg-primary/10 px-3 py-1.5 rounded-xl w-fit">
            Day {currentDay} of {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden group transition-all hover:border-indigo-500/30">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
            <Plus className="w-16 h-16 text-indigo-500" />
          </div>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Active Rooms</p>
          <h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">{rooms.length}</h3>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold bg-indigo-400/10 px-3 py-1.5 rounded-xl w-fit">
            {rooms.length} shared rooms
          </div>
        </div>
      </div>

      {/* Row 1: Expense Trend (2 cols) & Active Budgets (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expense Trend Chart (2 columns) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-xl font-bold text-foreground">Expense Trend</h2>
              <p className="text-muted-foreground text-xs mt-1">Daily spending pattern (Last 7 Days)</p>
            </div>
            <div className="text-xs font-bold text-muted-foreground bg-secondary px-3 py-1.5 rounded-xl">
              Last 7 Days
            </div>
          </div>

          <div className="h-[280px] w-full -ml-4 md:-ml-6">
            <ResponsiveContainer width="105%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10}
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10}
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `₹${value}`}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--popover))", 
                    border: "1px solid hsl(var(--border))", 
                    borderRadius: "16px",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    padding: "12px"
                  }}
                  itemStyle={{ color: "hsl(var(--popover-foreground))", fontWeight: "bold" }}
                  cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3b82f6" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Budgets Widget (1 column) */}
        <div className="lg:col-span-1">
          <ActiveBudgetsWidget 
            categories={budgetsData?.categories || []} 
            loading={loading} 
            onAlertClick={(item) => {
              setActiveAlertItem(item);
              setIsAlertModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Row 2: Full-Width Activity Table (Latest 20) */}
      <div className="bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
              <p className="text-xs text-muted-foreground">Showing the latest 20 transactions</p>
            </div>
          </div>

          <Link
            href="/activity"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border text-foreground text-xs font-bold rounded-xl transition-all self-start sm:self-auto group"
          >
            <span>See all transactions</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-primary" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3 py-6 animate-pulse">
            <div className="h-12 bg-secondary/50 rounded-2xl" />
            <div className="h-12 bg-secondary/50 rounded-2xl" />
            <div className="h-12 bg-secondary/50 rounded-2xl" />
          </div>
        ) : latest20Expenses.length === 0 ? (
          <div className="text-center py-16">
            <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-base font-bold text-foreground">No transactions recorded</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Start by adding your first daily expense or use the bulk one-liner input.
            </p>
            <Link
              href="/expenses/quick-add"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-2xl shadow-sm hover:bg-primary/90 transition-all"
            >
              <Sparkles className="w-4 h-4" /> Quick Add Expenses
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/30 border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 pl-4">Date</th>
                  <th className="p-3.5">Description / Note</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-right">Amount</th>
                  <th className="p-3.5 pr-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {latest20Expenses.map((exp) => {
                  const Icon = getCategoryIcon(exp.category);
                  const color = getCategoryColor(exp.category);

                  return (
                    <tr key={exp.id} className="hover:bg-secondary/20 transition-colors group">
                      <td className="p-3.5 pl-4 text-xs text-muted-foreground font-medium whitespace-nowrap">
                        {formatDate(exp.date)}
                      </td>
                      <td className="p-3.5 font-bold text-foreground">
                        {exp.note || <span className="text-muted-foreground italic font-normal">No note</span>}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${color.bg} ${color.text} border ${color.border}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-black text-sm text-foreground whitespace-nowrap">
                        -{formatCurrency(exp.amount)}
                      </td>
                      <td className="p-3.5 pr-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
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
      </div>
    </div>
  );
}
