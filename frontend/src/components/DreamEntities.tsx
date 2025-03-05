// src/components/DreamEntities.tsx
"use client";
import React from "react";
import { Player } from "@/store/gameStore";

interface DreamEntitiesProps {
  player: Player;
  onUse: (entity: string) => void;
}

export default function DreamEntities({ player, onUse }: DreamEntitiesProps) {
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      {player.dreamEntities.map((entity, idx) => {
        const displayName = getEntityName(entity);
        const desc = getEntityDescription(entity);
        return (
          <button
            key={idx}
            onClick={() => onUse(entity)}
            style={{
              backgroundColor: "#7d1414",
              border: "1px solid #ccc",
              width: "60px",
              height: "90px",
              color: "white",
              padding: "0.3rem",
              cursor: "pointer",
            }}
          >
            <div style={{ fontSize: "10px", textAlign: "center" }}>
              {displayName}
            </div>
            <div
              style={{
                fontSize: "12px",
                margin: "0.2rem 0",
                textAlign: "center",
              }}
            >
              <span role="img" aria-label="entity">
                👻
              </span>
            </div>
            <div style={{ fontSize: "8px", textAlign: "center" }}>{desc}</div>
          </button>
        );
      })}
    </div>
  );
}

function getEntityName(e: string): string {
  switch (e) {
    case "A":
      return "Wisdom Eater";
    case "B":
      return "Scout";
    case "C":
      return "Gambler";
    case "D":
      return "Gift";
    case "E":
      return "Guillotine";
    default:
      return e;
  }
}

function getEntityDescription(e: string): string {
  switch (e) {
    case "A":
      return "Steal 1 wisdom";
    case "B":
      return "See opponent's entities once";
    case "C":
      return "Roll dice: even=+2 wisdom, odd=-20 insanity";
    case "D":
      return "Draw new point card, discard random one";
    case "E":
      return "Flip coin: heads=lose 50, tails=opponent loses 50";
    default:
      return "";
  }
}
