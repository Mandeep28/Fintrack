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
  DollarSign
} from "lucide-react";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";
import Modal from "@/components/ui/Modal";
import AddExpenseForm from "@/components/forms/AddExpenseForm";

export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = use(params);
  const [room, setRoom] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  useEffect(() => {
    fetchRoomData();
  }, [roomId]);

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

  if (loading) return <div className="animate-pulse space-y-8">
     <div className="h-20 bg-slate-900 rounded-3xl" />
     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div className="h-32 bg-slate-900 rounded-3xl" />
       <div className="h-32 bg-slate-900 rounded-3xl" />
       <div className="h-32 bg-slate-900 rounded-3xl" />
     </div>
  </div>;

  if (!room) return <div className="text-center py-20 text-slate-400">Room not found</div>;

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-600 rounded-3xl shadow-lg shadow-blue-600/20">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white leading-tight">{room.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
              )} />
              <p className="text-slate-400 text-sm font-medium">
                {isConnected ? "Real-time sync active" : "Disconnected"}
              </p>
              <span className="text-slate-700">•</span>
              <p className="text-slate-400 text-sm">{room.members.length} Members</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all">
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Room Expense
          </button>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Add Expense to ${room.name}`}
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Monthly Settlement
            </h2>
            <p className="text-slate-400 text-sm">Automatic balance calculation for February 2026.</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-center md:text-right">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Total Room Expense</p>
              <p className="text-2xl font-black text-white">{formatCurrency(summary?.totalExpense || 0)}</p>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div className="text-center md:text-right">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Split Amount</p>
              <p className="text-2xl font-black text-blue-500">{formatCurrency(summary?.splitAmount || 0)}</p>
            </div>
          </div>
        </div>
        
        <div className="p-4 md:p-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {summary?.balances.map((bal: any) => (
               <div key={bal.userId} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                 <p className="text-slate-400 text-xs font-medium mb-3 uppercase tracking-wider">{bal.name}</p>
                 <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-bold text-white">{formatCurrency(bal.paid)}</p>
                      <p className="text-slate-500 text-[10px] mt-1 italic">Total Paid</p>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-lg text-xs font-bold",
                      bal.balance >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {bal.balance >= 0 ? `+${formatCurrency(bal.balance)}` : formatCurrency(bal.balance)}
                    </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Expense History */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-8">Expense History</h2>
        <div className="space-y-4">
          {room.expenses.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
               <DollarSign className="w-12 h-12 text-slate-700 mx-auto mb-4" />
               <p className="text-slate-500">No expenses recorded for this room yet.</p>
            </div>
          ) : (
            room.expenses.map((exp: any) => (
              <div key={exp.id} className="flex items-center justify-between p-5 bg-slate-800/30 rounded-2xl hover:bg-slate-800/50 transition-all group border border-transparent hover:border-slate-700">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 font-bold group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-105">
                    {exp.category[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-white font-bold group-hover:text-blue-400 transition-colors">{exp.category}</h4>
                    <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                      <span className="font-semibold text-slate-400">{exp.user.name}</span>
                      <span>•</span>
                      <span>{formatDate(exp.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-white group-hover:text-blue-500 transition-colors">
                    {formatCurrency(exp.amount)}
                  </p>
                  {exp.note && <p className="text-slate-500 text-[10px] mt-1 italic">{exp.note}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
