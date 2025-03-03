import { io } from "socket.io-client";

console.log("🔄 Attempting WebSocket connection...");

const socket = io("http://localhost:3001", {
  transports: ["websocket"], // Force WebSocket transport
  reconnectionAttempts: 5, // Retry 5 times if connection fails
  timeout: 5000, 
});

socket.on("connect", () => {
  console.log("✅ Connected to backend WebSocket!", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ WebSocket connection error:", err.message);
});

socket.on("message", (msg) => {
  console.log("📩 Message from server:", msg);
});

export default socket;
