'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import axios from "axios";
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Activity,
  ArrowUpRight,
  PlusCircle,
  Trash2,
  Pencil
} from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import AddExpenseForm from "@/components/forms/AddExpenseForm";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { getCategoryIcon } from "@/lib/icons";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, roomsRes] = await Promise.all([
        axios.get("/api/expenses"),
        axios.get("/api/rooms")
      ]);
      setExpenses(expensesRes.data);
      setRooms(roomsRes.data);
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
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete expense");
    }
  };

  const openEditModal = (expense: any) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  
  // Calculate chart data based on last 7 days of real expenses
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

  // Calculate percentage change (mocking previous month comparison for now but using real totals)
  // In a real app, we would fetch previous month's total
  const prevMonthTotal = totalSpent * 0.9; // Simulated baseline
  const percentageChange = prevMonthTotal > 0 
    ? ((totalSpent - prevMonthTotal) / prevMonthTotal * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Hello, {session?.user?.name || "User"}</h1>
          <p className="text-muted-foreground text-sm md:text-base">Here's what's happening with your money today.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all w-full sm:w-fit"
        >
          <PlusCircle className="w-5 h-5" />
          Add Expense
        </button>
      </div>

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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden group transition-all hover:border-blue-500/30">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-blue-500" />
          </div>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Total Spent</p>
          <h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">{formatCurrency(totalSpent)}</h3>
          <div className={cn(
            "flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl w-fit",
            Number(percentageChange) >= 0 ? "text-rose-400 bg-rose-400/10" : "text-emerald-400 bg-emerald-400/10"
          )}>
            <ArrowUpRight className={cn("w-3.5 h-3.5", Number(percentageChange) < 0 && "rotate-90")} />
            {Math.abs(Number(percentageChange))}% {Number(percentageChange) >= 0 ? "up" : "down"}
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden group transition-all hover:border-purple-500/30">
           <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
            <Activity className="w-16 h-16 text-purple-500" />
          </div>
          <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">Average Daily</p>
          <h3 className="text-3xl font-black text-foreground mb-4 tracking-tight">{formatCurrency(totalSpent / (new Date().getDate()))}</h3>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold bg-purple-400/10 px-3 py-1.5 rounded-xl w-fit">
            On track this month
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-[2.5rem] p-6 md:p-10 shadow-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h2 className="text-xl font-bold text-foreground">Expense Trend</h2>
              <p className="text-muted-foreground text-xs mt-1 tracking-wide">Daily spending insights</p>
            </div>
            <Select defaultValue="7days">
              <SelectTrigger className="w-[140px] h-10 text-[10px] font-bold rounded-xl bg-secondary border-border pl-4">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="h-[280px] md:h-[320px] w-full -ml-4 md:-ml-6">
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

        {/* Transactions */}
        <div className="bg-card border border-border rounded-[2.5rem] p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-xl font-bold text-foreground">Activity</h2>
            <Link href="/expenses" className="text-primary text-xs font-bold hover:underline">View All</Link>
          </div>
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-dashed border-border">
                  <Activity className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">No recent transactions</p>
              </div>
            ) : (
              expenses.slice(0, 5).map((exp) => {
                const Icon = getCategoryIcon(exp.category);
                return (
                  <div key={exp.id} className="flex items-center justify-between group p-3 -mx-3 rounded-2xl hover:bg-muted/40 transition-all border border-transparent hover:border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-muted rounded-[14px] flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-foreground font-bold text-sm group-hover:text-primary transition-colors">{exp.category}</p>
                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-tighter mt-0.5">{formatDate(exp.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-3">
                      <p className="text-foreground font-black text-sm text-right shrink-0">-{formatCurrency(exp.amount)}</p>
                      <div className="flex items-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(exp);
                          }}
                          className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 hidden sm:block"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteExpense(exp.id);
                          }}
                          className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
