"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = (roomId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    const socketInstance = io(socketUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      if (roomId) {
        socketInstance.emit("join-room", roomId);
      }
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [roomId]);

  return { socket, isConnected };
};
