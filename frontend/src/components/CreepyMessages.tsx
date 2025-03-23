"use client";
import React, { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";

const CREEPY_PHRASES = [
  "Hello?",
  "Wake up...",
  "WAKE UP!!!",
  "It's pointless...",
  "Are you awake?",
  "Just go to sleep...",
  "Fall asleep...",
  "You?",
  "Me?",
  "Is anyone here?",
  "Time is meaningless...",
  "Are you sure this is real?",
  "Don't look away...",
  "Close your eyes...",
  "It's cold...",
  "Why are you still awake?",
  "Escape...",
  "Everything is a dream...",
  "I can't feel anything...",
  "Help...",
];

function getSpawnCountBySanity(sanity: number): number {
  if (sanity <= 50) return 5;
  if (sanity <= 60) return 4;
  if (sanity <= 70) return 3;
  if (sanity <= 90) return 2;
  return 1;
}

interface Whisper {
  id: number;
  text: string;
  x: number;
  y: number;
}

export default function CreepyMessages() {
  const { players, currentPlayerIndex, gameOver } = useGameStore();
  const player = players[currentPlayerIndex];
  const sanity = player.sanity;

  const [activeWhispers, setActiveWhispers] = useState<Whisper[]>([]);

  // Spawn count based on sanity
  function spawnWhispers(count: number) {
    const newMessages: Whisper[] = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * CREEPY_PHRASES.length);
      const phrase = CREEPY_PHRASES[randomIndex];
      const x = Math.random() * 80 + 10; // between 10% and 90%
      const y = Math.random() * 80 + 10; // between 10% and 90%
      newMessages.push({
        id: Date.now() + i,
        text: phrase,
        x,
        y,
      });
    }
    setActiveWhispers((prev) => [...prev, ...newMessages]);
    newMessages.forEach((msg) => {
      setTimeout(() => {
        setActiveWhispers((prev) => prev.filter((m) => m.id !== msg.id));
      }, 3000);
    });
  }

  // Schedule a spawn at random intervals (10–30s)
  function scheduleNextSpawn() {
    if (gameOver) return; // stop if game ended
    const nextDelay = Math.random() * 20_000 + 10_000; // 10–30s
    setTimeout(() => {
      const count = getSpawnCountBySanity(sanity);
      spawnWhispers(count);
      scheduleNextSpawn();
    }, nextDelay);
  }

  useEffect(() => {
    scheduleNextSpawn();
    // Re-run if sanity changes (game is still ongoing)
  }, [gameOver, sanity]);

  // When game ends, spawn an immediate burst of whispers
  useEffect(() => {
    if (gameOver) {
      spawnWhispers(10);
    }
  }, [gameOver]);

  return (
    <>
      {activeWhispers.map((msg) => (
        <div
          key={msg.id}
          style={{
            position: "absolute",
            left: msg.x + "%",
            top: msg.y + "%",
            transform: "translate(-50%, -50%)",
            color: "#ff0000",
            fontSize: "1.2rem",
            fontStyle: "italic",
            textShadow: "1px 1px 2px black",
            pointerEvents: "none",
            transition: "opacity 0.3s",
          }}
        >
          {msg.text}
        </div>
      ))}
    </>
  );
}
