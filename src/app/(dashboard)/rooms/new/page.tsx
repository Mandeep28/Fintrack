"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Users, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("/api/rooms", { name });
      router.push(`/rooms/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <Link 
        href="/rooms"
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Rooms
      </Link>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-blue-600 rounded-2xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Room</h1>
            <p className="text-slate-400 text-sm">Organize shared expenses with others.</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400 ml-1">Room Name</label>
            <input
              type="text"
              required
              autoFocus
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
              placeholder="e.g. Flatmates, Trip to Goa, Family"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="pt-4">
             <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Room"}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-800">
          <h4 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">How rooms work</h4>
          <ul className="space-y-3">
             {[
               "Invite others using the room link",
               "Anyone can add shared expenses",
               "Real-time sync for everyone in the room",
               "Automatic monthly settlement calculation"
             ].map((text, i) => (
               <li key={i} className="flex items-start gap-3 text-sm text-slate-500">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                 {text}
               </li>
             ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
