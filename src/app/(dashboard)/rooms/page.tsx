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
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Rooms</h1>
          <p className="text-muted-foreground text-sm md:text-base mt-1">Manage shared expenses with your friends and family.</p>
        </div>
        <Link 
          href="/rooms/new"
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all w-full sm:w-fit cursor-pointer text-sm"
        >
          <Plus className="w-5 h-5" />
          Create Room
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-3xl p-6 h-48 animate-pulse" />
          ))
        ) : rooms.length === 0 ? (
          <div className="col-span-full bg-card border border-border rounded-3xl p-12 text-center shadow-sm">
             <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
               <Users className="w-8 h-8 text-muted-foreground" />
             </div>
             <h2 className="text-xl font-bold text-foreground mb-2">No rooms found</h2>
             <p className="text-muted-foreground mb-6">Create your first room to start splitting expenses.</p>
             <Link 
                href="/rooms/new"
                className="text-primary font-bold hover:underline transition-colors"
              >
                Create a room now &rarr;
              </Link>
          </div>
        ) : (
          rooms.map((room) => (
            <Link 
              key={room.id}
              href={`/rooms/${room.id}`}
              className="bg-card border border-border rounded-3xl p-6 hover:border-primary/50 hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Users className="w-6 h-6" />
                </div>
                <div className="bg-secondary text-muted-foreground px-3 py-1 rounded-full text-xs font-semibold">
                  {room._count.members} Members
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{room.name}</h3>
              <p className="text-muted-foreground text-sm mb-6">Split everything equally. Instantly.</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                  <MessageSquare className="w-4 h-4" />
                  Real-time enabled
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
