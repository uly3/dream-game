"use client";
import socket from "@/lib/socket";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function HomePage() {
  console.log("HomePage rendered!", socket.id);
  redirect("/menu");
}
