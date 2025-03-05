// src/components/NumberCards.tsx
"use client";
import React from "react";
import { Player } from "@/store/gameStore";

interface NumberCardsProps {
  player: Player;
  onSelect: (card: number) => void;
  shadowCount?: number; // how many cards to obscure
}

export default function NumberCards({
  player,
  onSelect,
  shadowCount = 0,
}: NumberCardsProps) {
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      {player.numberCards.map((card, idx) => {
        const isObscured = idx < shadowCount;
        return (
          <button
            key={idx}
            onClick={() => onSelect(card)}
            style={{
              backgroundColor: "#e0e0e0",
              border: "1px solid #ccc",
              width: "60px",
              height: "90px",
              position: "relative",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "2px",
                left: "2px",
                fontSize: "10px",
              }}
            >
              {isObscured ? "???" : card}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <span style={{ fontSize: "20px" }}>
                {isObscured ? "???" : card}
              </span>
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                right: "2px",
                fontSize: "10px",
              }}
            >
              {isObscured ? "???" : card}
            </div>
          </button>
        );
      })}
    </div>
  );
}
