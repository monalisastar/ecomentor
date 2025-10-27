"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";;;
import { io, Socket } from "socket.io-client";;;

interface SocketContextProps {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextProps>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s: Socket = io("/", {
      path: "/api/socket", // must match backend
      transports: ["websocket", "polling"],
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};
