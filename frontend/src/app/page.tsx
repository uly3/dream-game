"use client";
import socket from "@/lib/socket";

export default function HomePage() {
  console.log("HomePage rendered!", socket.id);
  return (
    <div>
      <h1>Home Page</h1>
      <p>Check your console for socket logs.</p>
    </div>
  );
}
