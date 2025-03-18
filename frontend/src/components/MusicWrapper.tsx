"use client";
import React from "react";
import MusicProvider from "./MusicProvider";

/**
 * Simple wrapper to place <MusicProvider> in your server layout
 * without turning layout into a client component.
 */
export default function MusicWrapper({ children }: { children: React.ReactNode }) {
  return <MusicProvider>{children}</MusicProvider>;
}
