"use client";

import { useEffect, useState } from "react";;;
import { io, Socket } from "socket.io-client";;;

let socket: Socket;

export default function SocketClient() {
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // Only initialize once
    if (!socket) {
      socket = io("http://localhost:3000", {
        path: "/api/socketio",
      });
    }

    // Listen to server events
    socket.on("student_fetched", (data) => {
      console.log("Student fetched:", data);
      setMessages((prev) => [...prev, `Student fetched: ${data.id}`]);
    });

    return () => {
      socket.off("student_fetched"); // clean up listener on unmount
    };
  }, []);

  return (
    <div>
      <h2>Socket Client</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}
