"use client";
import React, { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";

// An example array of random phrases. You can expand this with more.
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

// How many messages to spawn at once, based on sanity breakpoints:
function getSpawnCountBySanity(sanity: number): number {
  // e.g. user said:
  // 100 => 1, 90 => 2, 70 => 3, 60 => 4, <=50 => 5
  if (sanity <= 50) return 5;
  if (sanity <= 60) return 4;
  if (sanity <= 70) return 3;
  if (sanity <= 90) return 2;
  return 1; // full sanity
}

interface Whisper {
  id: number;       // unique for React
  text: string;     // the phrase
  x: number;        // random left
  y: number;        // random top
}

export default function CreepyMessages() {
  const {
    players,
    currentPlayerIndex,
    gameOver,
    gameOverCountdown,
  } = useGameStore();

  // We assume "player" is always at currentPlayerIndex for single Player vs CPU.
  // If you have multiple players, adapt accordingly.
  const player = players[currentPlayerIndex];
  const sanity = player.insanity;

  // Local state for messages currently on screen
  const [activeWhispers, setActiveWhispers] = useState<Whisper[]>([]);
  const [timerActive, setTimerActive] = useState(true);

  // Helper: spawn N random messages
  function spawnWhispers(count: number) {
    const newMessages: Whisper[] = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * CREEPY_PHRASES.length);
      const phrase = CREEPY_PHRASES[randomIndex];
      // Random screen position (0–100% minus some margin so it doesn't go offscreen)
      const x = Math.random() * 80 + 10; // between 10% and 90%
      const y = Math.random() * 80 + 10; // between 10% and 90%
      newMessages.push({
        id: Date.now() + i, // not perfect, but fine for demo
        text: phrase,
        x,
        y,
      });
    }
    // Add them
    setActiveWhispers((prev) => [...prev, ...newMessages]);

    // Remove each after ~3 seconds
    newMessages.forEach((msg) => {
      setTimeout(() => {
        setActiveWhispers((prev) => prev.filter((m) => m.id !== msg.id));
      }, 3000);
    });
  }

  // A function that sets up the random interval (10–30s) to spawn messages
  function scheduleNextSpawn() {
    if (gameOver) return; // stop scheduling if game ended
    const nextDelay = Math.random() * 20_000 + 10_000; // 10–30s
    setTimeout(() => {
      // figure out how many to spawn from sanity
      const count = getSpawnCountBySanity(sanity);
      spawnWhispers(count);
      // schedule again
      scheduleNextSpawn();
    }, nextDelay);
  }

  // On mount, start the schedule
  useEffect(() => {
    if (!gameOver && timerActive) {
      scheduleNextSpawn();
      setTimerActive(false); // only start once
    }
  }, [gameOver, timerActive]);

  // If the game ends => spawn a big "burst" of messages
  useEffect(() => {
    if (gameOver) {
      // spawn e.g. 10 messages instantly
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
            pointerEvents: "none", // so you can click through
            transition: "opacity 0.3s",
            // you can add animation/fade if you want
          }}
        >
          {msg.text}
        </div>
      ))}
    </>
  );
}
