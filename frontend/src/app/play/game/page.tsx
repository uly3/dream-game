"use client";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import styles from "./GameBoard.module.css";

// Dynamically import the PixiBoard, disabling SSR
const PixiBoard = dynamic(() => import("./PixiBoard"), {
  ssr: false,
});

export default function GameBoardPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "cpu";

  return (
    <div className={styles.container}>
      <h2>Game Board - Mode: {mode.toUpperCase()}</h2>
      <PixiBoard mode={mode} />
    </div>
  );
}
