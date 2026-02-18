"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Users, Plus, ArrowRight, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await axios.get("/api/rooms");
        setRooms(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Rooms</h1>
          <p className="text-slate-400">Manage shared expenses with your friends and family.</p>
        </div>
        <Link 
          href="/rooms/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-blue-600/20 transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Room
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 h-48 animate-pulse" />
          ))
        ) : rooms.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
             <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
               <Users className="w-8 h-8 text-slate-500" />
             </div>
             <h2 className="text-xl font-bold text-white mb-2">No rooms found</h2>
             <p className="text-slate-400 mb-6">Create your first room to start splitting expenses.</p>
             <Link 
                href="/rooms/new"
                className="text-blue-500 font-semibold hover:text-blue-400 transition-colors"
              >
                Create a room now &rarr;
              </Link>
          </div>
        ) : (
          rooms.map((room) => (
            <Link 
              key={room.id}
              href={`/rooms/${room.id}`}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <div className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-medium">
                  {room._count.members} Members
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{room.name}</h3>
              <p className="text-slate-500 text-sm mb-6">Split everything equally. Instantly.</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <MessageSquare className="w-4 h-4" />
                  Real-time enabled
                </div>
                <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
