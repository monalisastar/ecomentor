import { NextResponse } from "next/server";
import { Server as IOServer } from "socket.io";

let io: IOServer | null = null;

export const GET = async () => {
  // Initialize Socket.IO server only once
  if (!io) {
    // Create a server-less Socket.IO instance (works with App Router)
    io = new IOServer({
      cors: { origin: "*" }, // restrict in production
      path: "/api/socket",
    });

    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("join-room", (room) => {
        socket.join(room);
        console.log(`Client ${socket.id} joined room ${room}`);
      });

      socket.on("message", (msg) => {
        console.log("Message received:", msg);
        io?.emit("message", msg); // broadcast
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  return NextResponse.json({ message: "Socket server initialized" });
};
