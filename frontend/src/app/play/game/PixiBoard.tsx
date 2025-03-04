"use client";
import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import styles from "./GameBoard.module.css";

interface PixiBoardProps {
  mode: string;
}

export default function PixiBoard({ mode }: PixiBoardProps) {
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  const pixiAppRef = useRef<PIXI.Application | null>(null);

  useEffect(() => {
    // Ensure we only run in a browser
    if (typeof window === "undefined") return;

    // Create Pixi Application
    const app = new PIXI.Application({
      width: 1280,
      height: 720,
      backgroundColor: 0x2e2e2e, // dreamGray
    });
    pixiAppRef.current = app;

    // Attach canvas to container
    const canvas = app.view as HTMLCanvasElement;
    if (pixiContainerRef.current) 
    {
        pixiContainerRef.current.appendChild(canvas);
    }

    // Draw a brown circle as the table
    const tableGraphics = new PIXI.Graphics();
    tableGraphics.beginFill(0x4b3a29); // dreamBrown
    tableGraphics.drawCircle(app.renderer.width / 2, app.renderer.height / 2, 200);
    tableGraphics.endFill();
    app.stage.addChild(tableGraphics);

    // Add "Wisdom Skulls" text
    const wisdomText = new PIXI.Text("Wisdom Skulls (Pile)", {
      fill: 0xffffff,
      fontSize: 18,
    });
    wisdomText.x = app.renderer.width / 2 - 80;
    wisdomText.y = app.renderer.height / 2 - 10;
    app.stage.addChild(wisdomText);

    // Decide how many players to show
    const playerPositions = [
      { x: 100, y: 100 },
      { x: 1000, y: 100 },
      { x: 100, y: 600 },
      { x: 1000, y: 600 },
    ];
    let numPlayers = 4;
    if (mode === "cpu" || mode === "1v1") {
      numPlayers = 2;
    }

    // Draw placeholder players
    for (let i = 0; i < numPlayers; i++) {
      const playerGraphics = new PIXI.Graphics();
      playerGraphics.beginFill(0x000000);
      playerGraphics.drawRect(0, 0, 80, 120);
      playerGraphics.endFill();

      playerGraphics.x = playerPositions[i].x;
      playerGraphics.y = playerPositions[i].y;
      app.stage.addChild(playerGraphics);

      const playerText = new PIXI.Text(`Player ${i + 1}`, {
        fill: 0xffffff,
        fontSize: 14,
      });
      playerText.x = playerPositions[i].x;
      playerText.y = playerPositions[i].y - 20;
      app.stage.addChild(playerText);
    }

    // Cleanup on unmount
    return () => {
      app.destroy(true);
    };
  }, [mode]);

  return <div className={styles.gameArea} ref={pixiContainerRef} />;
}
