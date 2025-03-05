// src/app/play/game/page.tsx
"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useGameStore } from "@/store/gameStore";
import styles from "./GameBoard.module.css";

//const PixiBoard = dynamic(() => import("./PixiBoard"), { ssr: false });

export default function GameBoardPage() {
    const {
      players,
      currentPlayerIndex,
      isPlayerAwake,
      flipInProgress,
      hasFlippedCoin,
      hasTakenAction,
      flipCountdown,
      flipCoin,
      gainWisdom,
      nextTurn,
      initGame,
    } = useGameStore();
  
    // Start the game on mount
    useEffect(() => {
      initGame();
    }, [initGame]);
  
    const currentPlayer = players[currentPlayerIndex];
  
    function handleFlip() {
      flipCoin();
    }
    function handleGainWisdom() {
      gainWisdom();
    }
    function handleEndTurn() {
      nextTurn();
    }
  
    // Minimal CPU logic
    useEffect(() => {
        if (currentPlayer.id === "cpu") {
          // Wait 1 second so we can see "Turn: CPU"
          const cpuTimeout = setTimeout(() => {
            // Double-check it's still CPU's turn
            if (useGameStore.getState().players[useGameStore.getState().currentPlayerIndex].id !== "cpu") {
              return;
            }
      
            flipCoin(); // start coin countdown
      
            // Wait the 3-second countdown for the coin flip
            const coinTimeout = setTimeout(() => {
              // Double-check again
              if (useGameStore.getState().players[useGameStore.getState().currentPlayerIndex].id !== "cpu") {
                return;
              }
      
              if (useGameStore.getState().isPlayerAwake) {
                if (Math.random() < 0.5) {
                  gainWisdom();
                }
              }
              nextTurn();
            }, 3000);
      
            // Cleanup the coinTimeout if effect re-runs
            return () => clearTimeout(coinTimeout);
          }, 1000);
      
          // Cleanup the cpuTimeout if effect re-runs
          return () => clearTimeout(cpuTimeout);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [currentPlayerIndex, players]); // <-- add `players` here        
  
    function renderCards(p: any) {
      if (p.id === "cpu") return "[Hidden]";
      return p.numberCards.join(", ");
    }
  
    return (
      <div style={{ color: "white", padding: "1rem", position: "relative", height: "100vh" }}>
        {/* Top banner showing whose turn it is */}
        <div style={{
          position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)",
          fontSize: "1.2rem", fontWeight: "bold"
        }}>
          Turn: {currentPlayer.id.toUpperCase()}
        </div>
  
        {/* CPU top-right corner */}
        <div style={{ position: "absolute", top: "50px", right: "50px" }}>
          <h3>{players.find(p => p.id === "cpu")?.id} (Roll: {players.find(p => p.id === "cpu")?.roll})</h3>
          <p>Insanity: {players.find(p => p.id === "cpu")?.insanity}</p>
          <p>Wisdom: {players.find(p => p.id === "cpu")?.wisdom}</p>
          <p>Number Cards: [Hidden]</p>
        </div>
  
        {/* Player bottom-left corner */}
        <div style={{ position: "absolute", bottom: "50px", left: "50px" }}>
          <h3>{players.find(p => p.id === "player")?.id} (Roll: {players.find(p => p.id === "player")?.roll})</h3>
          <p>Insanity: {players.find(p => p.id === "player")?.insanity}</p>
          <p>Wisdom: {players.find(p => p.id === "player")?.wisdom}</p>
          <p>Number Cards: {renderCards(players.find(p => p.id === "player"))}</p>
        </div>
  
        {/* Middle area */}
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          textAlign: "center"
        }}>
          {/* If flipInProgress, show countdown */}
          {flipInProgress && (
            <p>Flipping coin... ({flipCountdown}s)</p>
          )}
  
          {hasFlippedCoin && (
            <p>{isPlayerAwake ? "You are AWAKE" : "You are ASLEEP"}</p>
          )}
  
          {/* Only if it's player's turn */}
          {currentPlayer.id === "player" && !flipInProgress && (
            <div style={{ marginTop: "1rem" }}>
              {!hasFlippedCoin && (
                <button onClick={handleFlip} disabled={hasFlippedCoin}>Flip Coin</button>
              )}
              {isPlayerAwake && !hasTakenAction && hasFlippedCoin && (
                <button onClick={handleGainWisdom}>Gain Wisdom</button>
              )}
              <button onClick={handleEndTurn}>End Turn</button>
            </div>
          )}
        </div>
      </div>
    );
  }
  