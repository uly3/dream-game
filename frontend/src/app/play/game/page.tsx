// src/app/play/game/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import DreamEntities from "@/components/DreamEntities";
import NumberCards from "@/components/NumberCards";

// Helper for displaying entity names in Scout
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
  
  export default function GameBoardPage() {
    const router = useRouter();
  
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
      initiateDuel,
      useEntityAbility,
      useWisdom,
      scoutEntities,
      scoutCountdown,
      gamblerRolling,
      gamblerResult,
      gamblerShowResult,
      gameOver,
      gameOverCountdown,
      gameOverMessage,
      fadeToBlack,
    } = useGameStore();
  
    useEffect(() => {
      initGame();
    }, [initGame]);
  
    // If the countdown hits 0 in a gameOver state, redirect to main menu
    useEffect(() => {
      if (gameOver && gameOverCountdown === 0) {
        router.push("/menu");
      }
    }, [gameOver, gameOverCountdown, router]);
  
    const currentPlayer = players[currentPlayerIndex];
    const cpuPlayer = players.find((p) => p.id === "cpu");
    const playerObj = players.find((p) => p.id === "player");
  
    // Minimal CPU logic
    useEffect(() => {
      if (currentPlayer.id === "cpu" && !currentPlayer.isEliminated && !gameOver) {
        const cpuTimeout = setTimeout(() => {
          if (
            useGameStore.getState().players[
              useGameStore.getState().currentPlayerIndex
            ].id !== "cpu"
          )
            return;
          flipCoin();
          const coinTimeout = setTimeout(() => {
            if (
              useGameStore.getState().players[
                useGameStore.getState().currentPlayerIndex
              ].id !== "cpu"
            )
              return;
            if (useGameStore.getState().isPlayerAwake) {
              if (Math.random() < 0.5) {
                gainWisdom();
              } else {
                // CPU might do random entity usage or dueling
              }
            }
            nextTurn();
          }, 3000);
          return () => clearTimeout(coinTimeout);
        }, 1000);
        return () => clearTimeout(cpuTimeout);
      }
    }, [currentPlayerIndex, currentPlayer, gameOver, flipCoin, gainWisdom, nextTurn]);
  
    // If gameOver => fade background
    if (gameOver) {
      // fadeFactor goes from 0 to 1 as countdown goes from 5 to 0
      const fadeFactor = 1 - gameOverCountdown / 5;
  
      // Base color: #d0c6c6 => rgb(208,198,198)
      // If fadeToBlack => fade from #d0c6c6 to #000
      // Else => fade from #d0c6c6 to #fff
  
      let startR = 208,
        startG = 198,
        startB = 198;
      let endR = fadeToBlack ? 0 : 255;
      let endG = fadeToBlack ? 0 : 255;
      let endB = fadeToBlack ? 0 : 255;
  
      const r = Math.round(startR + (endR - startR) * fadeFactor);
      const g = Math.round(startG + (endG - startG) * fadeFactor);
      const b = Math.round(startB + (endB - startB) * fadeFactor);
  
      return (
        <div
          style={{
            color: "white",
            padding: "1rem",
            position: "relative",
            height: "100vh",
            backgroundColor: `rgb(${r}, ${g}, ${b})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 1s linear",
          }}
        >
          <h2>{gameOverMessage}</h2>
          <p>Returning to reality in {gameOverCountdown}s...</p>
        </div>
      );
    }
  
    // Normal in-game UI
    function renderGamblerMessage() {
      if (gamblerRolling > 0) {
        return <p style={{ color: "lime" }}>Rolling dice... ({gamblerRolling}s)</p>;
      }
      if (gamblerResult !== null && gamblerShowResult > 0) {
        const evenOdd =
          gamblerResult % 2 === 0 ? "even => +2 wisdom" : "odd => -20 insanity";
        return (
          <p style={{ color: "lime" }}>
            You rolled {gamblerResult} ({evenOdd}) ({gamblerShowResult}s)
          </p>
        );
      }
      return null;
    }
  
    function getShadowedCount(insanity: number): number {
      if (insanity < 40) return 3;
      if (insanity < 50) return 2;
      if (insanity < 60) return 1;
      return 0;
    }
  
    // Show player's number cards
    function renderNumberCards() {
      if (!playerObj) return null;
      const shadowCount = getShadowedCount(playerObj.insanity);
      return (
        <NumberCards
          player={playerObj}
          onSelect={(card) => initiateDuel(card)}
          shadowCount={shadowCount}
        />
      );
    }
  
    // Show player's dream entities
    function renderDreamEntities() {
      if (!playerObj) return null;
      return (
        <DreamEntities
          player={playerObj}
          onUse={(entity) => useEntityAbility(entity)}
        />
      );
    }
  
    // Whether the player can do "Use Wisdom"
    const canUseWisdom =
      currentPlayer.wisdom >= 5 && !hasTakenAction && isPlayerAwake && hasFlippedCoin;
  
    // Convert letters -> full names for the Scout
    function scoutEntityNames(entities: string[]): string[] {
      return entities.map((e) => getEntityName(e));
    }
  
    return (
      <div
        style={{
          color: "white",
          padding: "1rem",
          position: "relative",
          height: "100vh",
          backgroundColor: "#d0c6c6",
        }}
      >
        {/* Top banner */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "1.2rem",
            fontWeight: "bold",
          }}
        >
          Turn: {currentPlayer.id.toUpperCase()}
        </div>
  
        {/* CPU info: top-right */}
        <div style={{ position: "absolute", top: "50px", right: "50px" }}>
          <h3>cpu (Roll: {cpuPlayer?.roll})</h3>
          <p>Insanity: {cpuPlayer?.insanity}</p>
          <p>Wisdom: {cpuPlayer?.wisdom}</p>
          <p>Dream Entities: {cpuPlayer ? cpuPlayer.dreamEntities.length : 0}</p>
        </div>
  
        {/* Player info: bottom-left */}
        <div style={{ position: "absolute", bottom: "50px", left: "50px" }}>
          <h3>player (Roll: {playerObj?.roll})</h3>
          <p>Insanity: {playerObj?.insanity}</p>
          <p>Wisdom: {playerObj?.wisdom}</p>
          <p>Dream Entities: {playerObj ? playerObj.dreamEntities.length : 0}</p>
        </div>
  
        {/* Middle area */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          {flipInProgress && <p>Flipping coin... ({flipCountdown}s)</p>}
          {hasFlippedCoin && (
            <p>{isPlayerAwake ? "You are AWAKE" : "You are ASLEEP"}</p>
          )}
  
          {/* If Scout is used: show opponent's dream entities for 5s, but map them to full names */}
          {scoutEntities && scoutCountdown > 0 && (
            <p style={{ color: "yellow", margin: "1rem 0" }}>
              Opponent’s Entities:{" "}
              {scoutEntityNames(scoutEntities).join(", ")} ({scoutCountdown}s)
            </p>
          )}
  
          {/* If Gambler is used: show dice rolling or result */}
          {renderGamblerMessage()}
  
          {/* Player’s turn controls */}
          {currentPlayer.id === "player" &&
            !flipInProgress &&
            !currentPlayer.isEliminated && (
              <div style={{ marginTop: "1rem" }}>
                {!hasFlippedCoin && (
                  <button onClick={() => flipCoin()}>Flip Coin</button>
                )}
  
                {isPlayerAwake && !hasTakenAction && hasFlippedCoin && (
                  <>
                    <div
                      style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
                    >
                      <button onClick={() => gainWisdom()}>Gain Wisdom</button>
                      <button onClick={() => useWisdom()} disabled={!canUseWisdom}>
                        Use Wisdom
                      </button>
                      <button onClick={() => nextTurn()}>End Turn</button>
                    </div>
  
                    <div
                      style={{
                        display: "flex",
                        gap: "2rem",
                        marginTop: "1rem",
                        justifyContent: "center",
                      }}
                    >
                      <div>
                        <p>Select a card to duel:</p>
                        {renderNumberCards()}
                      </div>
                      <div>
                        <p>Select a Dream Entity ability:</p>
                        {renderDreamEntities()}
                      </div>
                    </div>
                  </>
                )}
  
                {(hasTakenAction || !isPlayerAwake) && (
                  <div style={{ marginTop: "1rem" }}>
                    <button onClick={() => nextTurn()}>End Turn</button>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    );
  }
