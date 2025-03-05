"use client";
import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { useGameStore } from "@/store/gameStore";
import styles from "./GameBoard.module.css";

interface PixiBoardProps {
  mode: string;
}

export default function PixiBoard({ mode }: PixiBoardProps) {
  const pixiContainerRef = useRef<HTMLDivElement>(null);

  // Access relevant state and actions
  const {
    players,
    currentPlayerIndex,
    isPlayerAwake,
    wisdomPile,
    flipCoin,
    gainWisdom,
    nextTurn,
  } = useGameStore();

  useEffect(() => {
    // Create Pixi app
    const app = new PIXI.Application<HTMLCanvasElement>({
      width: 1280,
      height: 720,
      backgroundColor: 0x2e2e2e,
    });
    if (pixiContainerRef.current) {
      pixiContainerRef.current.appendChild(app.view);
    }

    // Render the board (table, wisdom pile, etc.)
    // Then render players
    drawBoard(app);
    drawPlayers(app, players);

    // Example: a button or clickable region for the Wisdom Pile
    // For now, let's just store x/y in a variable
    // (We can refine with real sprites later.)
    const wisdomHitArea = new PIXI.Graphics();
    wisdomHitArea.beginFill(0xffffff, 0); // invisible fill
    wisdomHitArea.drawCircle(app.renderer.width / 2, app.renderer.height / 2, 50);
    wisdomHitArea.endFill();
    wisdomHitArea.interactive = true;
    wisdomHitArea.on("pointerdown", () => {
      // Attempt to gain wisdom if it's your turn and you're awake
      gainWisdom();
    });
    app.stage.addChild(wisdomHitArea);

    // Cleanup
    return () => {
      app.destroy(true);
    };
  }, [players, isPlayerAwake, wisdomPile, gainWisdom]);

  // CPU Logic (simplified)
  useEffect(() => {
    const currentPlayer = players[currentPlayerIndex];
    if (currentPlayer.id === "cpu") {
      // If it's CPU's turn, do a minimal AI
      setTimeout(() => {
        cpuTakeTurn();
      }, 1000);
    }
  }, [currentPlayerIndex]);

  function cpuTakeTurn() {
    // 1) Flip coin
    flipCoin();
    // 2) If awake, randomly choose an action (gainWisdom or do nothing)
    const awake = useGameStore.getState().isPlayerAwake;
    if (awake) {
      // e.g. 50% chance to gain wisdom
      if (Math.random() < 0.5) {
        gainWisdom();
      }
      // else do nothing or pick an entity ability, etc.
    }
    // 3) End turn
    nextTurn();
  }

  return <div className={styles.gameArea} ref={pixiContainerRef} />;
}

// Example: Helper function to draw the table
function drawBoard(app: PIXI.Application) {
  const tableGraphics = new PIXI.Graphics();
  tableGraphics.beginFill(0x4b3a29); // dreamBrown
  tableGraphics.drawCircle(app.renderer.width / 2, app.renderer.height / 2, 200);
  tableGraphics.endFill();
  app.stage.addChild(tableGraphics);

  // Add text for "Wisdom Skulls (Pile)"
  const wisdomText = new PIXI.Text("Wisdom Skulls (Pile)", {
    fill: 0xffffff,
    fontSize: 18,
  });
  wisdomText.x = app.renderer.width / 2 - 80;
  wisdomText.y = app.renderer.height / 2 - 10;
  app.stage.addChild(wisdomText);
}

function drawPlayers(app: PIXI.Application, players: any[]) {
  const positions = [
    { x: 100, y: 100 },
    { x: 1000, y: 100 },
    { x: 100, y: 600 },
    { x: 1000, y: 600 },
  ];

  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const { x, y } = positions[i];
    // Just a placeholder black box for "player area"
    const box = new PIXI.Graphics();
    box.beginFill(0x000000);
    box.drawRect(0, 0, 100, 150);
    box.endFill();
    box.x = x;
    box.y = y;
    app.stage.addChild(box);

    // Player label
    const label = new PIXI.Text(`${player.id} (Insanity: ${player.insanity})`, {
      fill: 0xffffff,
      fontSize: 14,
    });
    label.x = x;
    label.y = y - 20;
    app.stage.addChild(label);
  }
}
