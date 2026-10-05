"use client";

import { useEffect, useState, use } from "react";
import axios from "axios";
import {
  Users,
  Plus,
  Settings,
  Calendar,
  AlertCircle,
  Share2,
  DollarSign,
  Trash2,
  TrendingUp,
  Pencil
} from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";
import Modal from "@/components/ui/Modal";
import AddExpenseForm from "@/components/forms/AddExpenseForm";
import { getCategoryIcon } from "@/lib/icons";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
  const { id: roomId } = use(params);
  const [room, setRoom] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const { socket, isConnected } = useSocket(roomId);

  const fetchRoomData = async () => {
    try {
      const [roomRes, summaryRes] = await Promise.all([
        axios.get(`/api/rooms/${roomId}`),
        axios.get(`/api/rooms/${roomId}/summary`)
      ]);
      setRoom(roomRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (id: string) => {
    // We can keep the simple confirm for now as a safeguard, 
    // but the success/error feedback should be toasts.
    if (!confirm("Are you sure you want to delete this room expense?")) return;
    try {
      await axios.delete(`/api/expenses/${id}`);
      fetchRoomData();
      if (socket) {
        socket.emit("expense-added", { roomId });
      }
      toast.success("Expense deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete expense");
    }
  };

  const openEditModal = (expense: any) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchRoomData();
  }, [roomId]);

  // Calculate chart data for room spending
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = room ? last7Days.map(dateStr => {
    const dailyTotal = room.expenses
      .filter((exp: any) => exp.date.split('T')[0] === dateStr)
      .reduce((sum: number, exp: any) => sum + Number(exp.amount), 0);

    return {
      name: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
      amount: dailyTotal,
    };
  }) : [];

  useEffect(() => {
    if (socket) {
      socket.on("expense-added", (data: any) => {
        if (data.roomId === roomId) {
          fetchRoomData();
        }
      });
    }
    return () => {
      if (socket) socket.off("expense-added");
    };
  }, [socket, roomId]);

  const handleShare = async () => {
    const url = `${window.location.origin}/rooms/${roomId}/join`;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for HTTP
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      toast.success("Join link copied to clipboard!", {
        description: "You can now share it with your friends.",
      });
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  if (loading) return (
    <div className="animate-pulse space-y-8">
      <div className="h-20 bg-card rounded-3xl border border-border" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-card rounded-3xl border border-border" />
        <div className="h-32 bg-card rounded-3xl border border-border" />
        <div className="h-32 bg-card rounded-3xl border border-border" />
      </div>
    </div>
  );

  if (!room) return <div className="text-center py-20 text-muted-foreground">Room not found</div>;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary rounded-3xl shadow-lg shadow-primary/20 shrink-0">
            <Users className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground truncate">{room.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                )} />
                <p className="text-muted-foreground text-xs font-bold uppercase tracking-tight">
                  {isConnected ? "Live" : "Offline"}
                </p>
              </div>
              {!isConnected && (
                <button
                  onClick={() => window.location.reload()}
                  className="text-primary text-[10px] font-bold uppercase hover:underline cursor-pointer"
                >
                  Retry
                </button>
              )}
              <span className="text-muted-foreground/40 hidden sm:inline">•</span>
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-tight">{room.members.length} Members</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex-1 sm:flex-none p-4 bg-secondary border border-border text-foreground hover:bg-secondary/80 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            title="Copy Join Link"
          >
            <Share2 className="w-5 h-5" />
            <span className="sm:hidden font-bold text-sm">Invite</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-[2] sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all text-sm whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Add Expense
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Room Expense"
      >
        <AddExpenseForm
          roomId={roomId}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchRoomData();
            if (socket) {
              socket.emit("expense-added", { roomId });
            }
          }}
        />
      </Modal>

      {/* Settlement Section */}
      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-xl">
        <div className="p-6 md:p-10 border-b border-border bg-secondary/30 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <Calendar className="w-5 h-5" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em]">Settlement</h2>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          <div className="flex items-center gap-8 md:gap-12">
            <div>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2 px-1">Total</p>
              <p className="text-2xl md:text-3xl font-black text-foreground">{formatCurrency(summary?.totalExpense || 0)}</p>
            </div>
            <div className="w-px h-12 bg-border hidden sm:block" />
            <div>
              <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-2 px-1">Per Head</p>
              <p className="text-2xl md:text-3xl font-black text-primary">{formatCurrency(summary?.splitAmount || 0)}</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-10 overflow-x-auto">
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 pb-2 md:pb-0 min-w-max md:min-w-0">
            {summary?.balances.map((bal: any) => (
              <div key={bal.userId} className="w-64 md:w-auto bg-secondary/40 rounded-3xl p-6 border border-border hover:border-primary/40 transition-all group">
                <p className="text-muted-foreground text-[10px] font-black mb-4 uppercase tracking-widest group-hover:text-primary transition-colors">{bal.name}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(bal.paid)}</p>
                    <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-tight mt-1">Paid</p>
                  </div>
                  <div className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black",
                    bal.balance >= 0 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                  )}>
                    {bal.balance >= 0 ? `+${formatCurrency(bal.balance)}` : formatCurrency(bal.balance)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics & History Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Room Analytics Chart */}
        <div className="bg-card border border-border rounded-[2.5rem] p-6 md:p-10 shadow-xl overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Trends
            </h2>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">Last 7 Days</p>
          </div>
          <div className="h-[250px] w-full -ml-4 md:-ml-6">
            <ResponsiveContainer width="105%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRoomAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "16px" }}
                  itemStyle={{ color: "hsl(var(--popover-foreground))", fontWeight: "bold" }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRoomAmount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense History */}
        <div className="bg-card border border-border rounded-[2.5rem] p-6 md:p-10 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-foreground">History</h2>
            <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{room.expenses.length} Records</span>
          </div>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {room.expenses.length === 0 ? (
              <div className="text-center py-20 bg-secondary/20 rounded-3xl border border-dashed border-border">
                <DollarSign className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm font-medium tracking-tight">No expenses yet</p>
              </div>
            ) : (
              room.expenses.map((exp: any) => {
                const Icon = getCategoryIcon(exp.category);
                const isOwner = exp.userId === session?.user?.id;

                return (
                  <div key={exp.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-3xl hover:bg-secondary/60 transition-all group border border-border">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-foreground font-bold group-hover:text-primary transition-colors truncate">{exp.category}</h4>
                        <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] font-bold uppercase tracking-tight mt-0.5">
                          <span className="text-foreground/80 truncate max-w-[80px]">{exp.user.name}</span>
                          <span>•</span>
                          <span>{formatDate(exp.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-black text-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                          {formatCurrency(exp.amount)}
                        </p>
                      </div>
                      <div className="w-10 flex justify-center">
                        {isOwner && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteExpense(exp.id);
                            }}
                            className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
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
