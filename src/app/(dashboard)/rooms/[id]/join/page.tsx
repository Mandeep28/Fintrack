"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, Users, AlertCircle } from "lucide-react";

export default function JoinRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: roomId } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const joinRoom = async () => {
      try {
        await axios.post(`/api/rooms/${roomId}/join`);
        router.replace(`/rooms/${roomId}`);
      } catch (err: any) {
        if (err.response?.status === 400 || err.response?.data?.message?.includes("already a member")) {
          // If already a member, just redirect
           router.replace(`/rooms/${roomId}`);
           return;
        }
        setError(err.response?.data?.message || "Failed to join room");
        setLoading(false);
      }
    };

    if (roomId) joinRoom();
  }, [roomId, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="p-4 bg-red-500/10 rounded-full mb-6">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Oops! Couldn't join room</h1>
        <p className="text-slate-400 mb-8 max-w-sm">{error}</p>
        <button 
          onClick={() => router.push("/rooms")}
          className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-xl font-semibold transition-all"
        >
          Back to Rooms
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
        <div className="relative p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl animate-bounce">
          <Users className="w-12 h-12 text-blue-500" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Joining Room...</h1>
      <p className="text-slate-400 flex items-center gap-2 justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        Setting up your workspace
      </p>
    </div>
  );
}
