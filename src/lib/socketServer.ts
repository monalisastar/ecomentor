import { Server as IOServer } from "socket.io";
import type { Server as NetServer } from "http";

let io: IOServer | null = null;

// Initialize Socket.IO server (singleton)
export function initIO(server: NetServer) {
  if (!io) {
    io = new IOServer(server, {
      cors: {
        origin: "*", // adjust to your frontend domain
      },
      path: "/api/socketio",
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });

    console.log("Socket.IO server initialized");
  }
  return io;
}

// Get existing Socket.IO instance
export function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}
