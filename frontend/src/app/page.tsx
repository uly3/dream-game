"use client";
import { redirect } from "next/navigation";

export default function HomePage() {
  //console.log("HomePage rendered!", socket.id);
  redirect("/menu");
}
