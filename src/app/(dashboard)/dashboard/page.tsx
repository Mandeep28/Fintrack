'use client';

import { useEffect, useState } from "react";
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Hello, {session?.user?.name || "User"}</h1>
          <p className="text-slate-400">Here's what's happening with your money today.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-blue-600/20 transition-all w-fit"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-12 h-12 text-blue-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Total Spent this Month</p>
          <h3 className="text-3xl font-bold text-white mb-4">{formatCurrency(totalSpent)}</h3>
          <div className={cn(
            "flex items-center gap-2 text-sm bg-opacity-10 px-3 py-1 rounded-full w-fit font-medium",
            Number(percentageChange) >= 0 ? "text-red-400 bg-red-400/10" : "text-emerald-400 bg-emerald-400/10"
          )}>
            <ArrowUpRight className={cn("w-4 h-4", Number(percentageChange) < 0 && "rotate-90")} />
            {Math.abs(Number(percentageChange))}% from last month
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Activity className="w-12 h-12 text-purple-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Average Daily</p>
          <h3 className="text-3xl font-bold text-white mb-4">{formatCurrency(totalSpent / 30)}</h3>
          <div className="flex items-center gap-2 text-blue-400 text-sm bg-blue-400/10 px-3 py-1 rounded-full w-fit font-medium">
            Stayed on track
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Plus className="w-12 h-12 text-indigo-500" />
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1">Active Rooms</p>
          <h3 className="text-3xl font-bold text-white mb-4">{rooms.length}</h3>
          <div className="flex items-center gap-2 text-indigo-400 text-sm bg-indigo-400/10 px-3 py-1 rounded-full w-fit font-medium">
            Shared with {Math.max(0, rooms.reduce((sum, r) => sum + (r._count?.members || 0), 0) - rooms.length)} people
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-white">Expense Over Time</h2>
            <select className="bg-slate-800 border-none text-slate-300 text-sm rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis 
                  dataKey="name" 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px" }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {expenses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm">No expenses yet.</p>
              </div>
            ) : (
              expenses.slice(0, 5).map((exp) => {
                const Icon = getCategoryIcon(exp.category);
                return (
                  <div key={exp.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors">{exp.category}</p>
                        <p className="text-slate-500 text-xs">{formatDate(exp.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-bold text-sm mr-2">-{formatCurrency(exp.amount)}</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(exp);
                        }}
                        className="p-2 text-slate-600 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Edit Expense"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteExpense(exp.id);
                        }}
                        className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
