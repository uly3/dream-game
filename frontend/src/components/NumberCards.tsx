"use client";
import React from "react";
import { Player } from "@/store/gameStore";
import styles from "@/app/play/game/GameBoard.module.css";

interface NumberCardsProps {
  player: Player;
  onSelect: (card: number) => void;
  shadowCount?: number; // number of cards to obscure for hallucination
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
        const displayValue = isObscured ? "???" : String(card);

        return (
          <button
            key={idx}
            className={`${styles.cardBase} ${styles.pointCard}`}
            onClick={() => onSelect(card)}
          >
            {/* Top-left corner */}
            <div className={styles.cardCornerTopLeft}>
              {displayValue}
            </div>

            {/* Big centered text */}
            <p className={styles.cardBaseText}>
              {displayValue}
            </p>

            {/* Bottom-right corner */}
            <div className={styles.cardCornerBottomRight}>
              {displayValue}
            </div>
          </button>
        );
      })}
    </div>
  );
}
