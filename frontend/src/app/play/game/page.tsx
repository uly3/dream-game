// src/app/play/game/page.tsx
"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import DreamEntities from "@/components/DreamEntities";
import NumberCards from "@/components/NumberCards";
import SoundButton from "@/components/SoundButton";
import { useBackgroundMusic } from "@/lib/soundManager";
import CreepyMessages from "@/components/CreepyMessages";
import styles from "./GameBoard.module.css";

function getDisplayName(id: string) {
  return id === "player" ? "You" : "You?";
}

// Helper: Map Scout letters to full names (if needed)
function scoutEntityNames(entities: string[]): string[] {
    return entities.map((e) => {
      switch (e) {
        case "A": return "Wisdom Eater";
        case "B": return "Scout";
        case "C": return "Gambler";
        case "D": return "Gift";
        case "E": return "Guillotine";
        default:  return e;
      }
    });
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
    musicVolume,
  } = useGameStore();

  // 1) Play game music
  useBackgroundMusic("/Main_Game_Loop_Song.wav", true, musicVolume / 100);

  // 2) initGame on mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  // 3) if gameOver countdown hits 0 => go to /menu
  useEffect(() => {
    if (gameOver && gameOverCountdown === 0) {
      router.push("/menu");
    }
  }, [gameOver, gameOverCountdown, router]);

  // 4) CPU logic
  const currentPlayer = players[currentPlayerIndex];
  const cpuPlayer = players.find((p) => p.id === "cpu");
  const playerObj = players.find((p) => p.id === "player");

  useEffect(() => {
    if (currentPlayer.id === "cpu" && !currentPlayer.isEliminated && !gameOver) {
      const cpuTimeout = setTimeout(() => {
        if (useGameStore.getState().players[useGameStore.getState().currentPlayerIndex].id !== "cpu") return;
        flipCoin();
        const coinTimeout = setTimeout(() => {
          if (useGameStore.getState().players[useGameStore.getState().currentPlayerIndex].id !== "cpu") return;
          if (useGameStore.getState().isPlayerAwake) {
            if (Math.random() < 0.5) {
              gainWisdom();
            }
          }
          nextTurn();
        }, 3000);
        return () => clearTimeout(coinTimeout);
      }, 1000);
      return () => clearTimeout(cpuTimeout);
    }
  }, [currentPlayerIndex, currentPlayer, gameOver, flipCoin, gainWisdom, nextTurn]);

  // 5) If gameOver => fade out screen
  if (gameOver) {
    const fadeFactor = 1 - gameOverCountdown / 5;
    const startColor = { r: 208, g: 198, b: 198 };
    const endColor = fadeToBlack ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
    const r = Math.round(startColor.r + (endColor.r - startColor.r) * fadeFactor);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * fadeFactor);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * fadeFactor);

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
        <CreepyMessages />
        <h2>{gameOverMessage}</h2>
        <p>Returning to reality in {gameOverCountdown}s...</p>
      </div>
    );
  }

  // gambler message
  function renderGamblerMessage() {
    if (gamblerRolling > 0) {
      return <p style={{ color: "lime" }}>Rolling dice... ({gamblerRolling}s)</p>;
    }
    if (gamblerResult !== null && gamblerShowResult > 0) {
      const evenOdd = gamblerResult % 2 === 0 ? "even => +2 wisdom" : "odd => -20 insanity";
      return (
        <p style={{ color: "lime" }}>
          You rolled {gamblerResult} ({evenOdd}) ({gamblerShowResult}s)
        </p>
      );
    }
    return null;
  }

  // hallucination shadows
  function getShadowedCount(insanity: number): number {
    if (insanity < 40) return 3;
    if (insanity < 50) return 2;
    if (insanity < 60) return 1;
    return 0;
  }

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

  function renderDreamEntities() {
    if (!playerObj) return null;
    return (
      <DreamEntities
        player={playerObj}
        onUse={(entity) => useEntityAbility(entity)}
      />
    );
  }

  const canUseWisdom = currentPlayer.wisdom >= 5 && !hasTakenAction && isPlayerAwake && hasFlippedCoin;

  function renderScoutMessage() {
    if (scoutEntities && scoutCountdown > 0) {
      const names = scoutEntityNames(scoutEntities).join(", ");
      
      return (
        <p style={{ color: "yellow", margin: "1rem 0" }}>
          Opponent’s Entities: {names} ({scoutCountdown}s)
        </p>
      );
    }
    return null;
  }

  return (
    <div className={styles.gameContainer}>
      <CreepyMessages />

      {/* Turn info */}
      <div className={styles.topBanner}>
        Turn: {getDisplayName(currentPlayer.id).toUpperCase()}
      </div>

      {/* CPU card */}
      <div className={styles.cpuInfo}>
        <div className={`${styles.infoCard} ${styles.cpuCard}`}>
          <h3>
            {getDisplayName("cpu")} (Roll: {cpuPlayer?.roll})
          </h3>
          <p>Insanity: {cpuPlayer?.insanity}</p>
          <p>Wisdom: {cpuPlayer?.wisdom}</p>
          <p>Dream Entities: {cpuPlayer ? cpuPlayer.dreamEntities.length : 0}</p>
        </div>
      </div>

      {/* Player card */}
      <div className={styles.playerInfo}>
        <div className={`${styles.infoCard} ${styles.playerCard}`}>
          <h3>
            {getDisplayName("player")} (Roll: {playerObj?.roll})
          </h3>
          <p>Insanity: {playerObj?.insanity}</p>
          <p>Wisdom: {playerObj?.wisdom}</p>
          <p>Dream Entities: {playerObj ? playerObj.dreamEntities.length : 0}</p>
        </div>
      </div>

      {/* Middle area */}
      <div className={styles.middleArea}>
        {flipInProgress && <p>Flipping coin... ({flipCountdown}s)</p>}
        {hasFlippedCoin && (
          <p>{isPlayerAwake ? "You are AWAKE" : "You are ASLEEP"}</p>
        )}

        {renderScoutMessage()}
        {renderGamblerMessage()}

        {/* Player controls */}
        {currentPlayer.id === "player" && !flipInProgress && !currentPlayer.isEliminated && (
          <div style={{ marginTop: "1rem" }}>
            {!hasFlippedCoin && (
              <SoundButton
                className={styles.actionButton}
                onClick={() => flipCoin()}
                hoverSoundSrc="/Piano_Hover_Effect.wav"
                clickSoundSrc="/Piano_Select_Effect.wav"
              >
                Flip Coin
              </SoundButton>
            )}

            {isPlayerAwake && !hasTakenAction && hasFlippedCoin && (
              <>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                  <SoundButton
                    className={styles.actionButton}
                    onClick={() => gainWisdom()}
                    hoverSoundSrc="/Piano_Hover_Effect.wav"
                    clickSoundSrc="/Piano_Select_Effect.wav"
                  >
                    Gain Wisdom
                  </SoundButton>
                  <SoundButton
                    className={styles.actionButton}
                    onClick={() => useWisdom()}
                    disabled={!canUseWisdom}
                    hoverSoundSrc="/Piano_Hover_Effect.wav"
                    clickSoundSrc="/Piano_Select_Effect.wav"
                  >
                    Use Wisdom
                  </SoundButton>
                  <SoundButton
                    className={styles.actionButton}
                    onClick={() => nextTurn()}
                    hoverSoundSrc="/Piano_Hover_Effect.wav"
                    clickSoundSrc="/Piano_Select_Effect.wav"
                  >
                    End Turn
                  </SoundButton>
                </div>

                <div style={{ display: "flex", gap: "2rem", marginTop: "1rem", justifyContent: "center" }}>
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
                <SoundButton
                  className={styles.actionButton}
                  onClick={() => nextTurn()}
                  hoverSoundSrc="/Piano_Hover_Effect.wav"
                  clickSoundSrc="/Piano_Select_Effect.wav"
                >
                  End Turn
                </SoundButton>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
