"use client";
import React from "react";
import { Player } from "@/store/gameStore";
import styles from "@/app/play/game/GameBoard.module.css";

interface DreamEntitiesProps {
  player: Player;
  onUse: (entity: string) => void;
}

function getEntityName(e: string): string {
  switch (e) {
    case "A": return "Wisdom Eater";
    case "B": return "Scout";
    case "C": return "Gambler";
    case "D": return "Gift";
    case "E": return "Guillotine";
    default: return e;
  }
}

function getEntityDescription(e: string): string {
  switch (e) {
    case "A": return "Steal 1 wisdom";
    case "B": return "See opponent's entities once";
    case "C": return "Roll dice: even=+2 wisdom, odd=-20 insanity";
    case "D": return "Draw new point card, discard random one";
    case "E": return "Flip coin: heads=lose 50, tails=opponent loses 50";
    default: return "";
  }
}

/** 
 * Returns a bigger icon path. Replace with real images in /public if desired.
 * Right now, they're just placeholders. 
 */
function getEntityIcon(e: string): string {
  switch (e) {
    case "A": return "/dream_entity.jpg"; 
    case "B": return "/scout.jpg";
    case "C": return "/gambler.jpg";
    case "D": return "/gift.jpg";
    case "E": return "/guillotine.jpg";
    default:  return "/cpu.jpg";
  }
}

export default function DreamEntities({ player, onUse }: DreamEntitiesProps) {
  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      {player.dreamEntities.map((entity, idx) => {
        const displayName = getEntityName(entity);
        const desc = getEntityDescription(entity);
        const iconSrc = getEntityIcon(entity);

        return (
          <button
            key={idx}
            className={`${styles.cardBase} ${styles.dreamCard}`}
            onClick={() => onUse(entity)}
          >
            {/* Larger icon at the top */}
            <img 
              src={iconSrc} 
              alt={entity} 
              className={styles.entityIconLarge}
            />

            {/* Name in the middle */}
            <div className={styles.dreamEntityName}>
              {displayName}
            </div>

            {/* Description pinned at the bottom */}
            <div className={styles.dreamEntityDesc}>
              {desc}
            </div>
          </button>
        );
      })}
    </div>
  );
}
