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
    <div className="max-w-xl mx-auto animate-in fade-in duration-500 pb-16">
      <Link 
        href="/rooms"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group font-medium text-sm"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Rooms
      </Link>

      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Create New Room</h1>
            <p className="text-muted-foreground text-sm">Organize shared expenses with others.</p>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-6 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Room Name</label>
            <input
              type="text"
              required
              autoFocus
              className="w-full bg-secondary/50 border border-border text-foreground rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-muted-foreground"
              placeholder="e.g. Flatmates, Trip to Goa, Family"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="pt-2">
             <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Room"}
            </button>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-border">
          <h4 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-wider">How rooms work</h4>
          <ul className="space-y-3">
             {[
               "Invite others using the room link",
               "Anyone can add shared expenses",
               "Real-time sync for everyone in the room",
               "Automatic monthly settlement calculation"
             ].map((text, i) => (
               <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                 {text}
               </li>
             ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
