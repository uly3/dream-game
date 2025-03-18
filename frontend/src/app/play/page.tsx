"use client";
import Link from "next/link";
import styles from "./PlayMenu.module.css";

export default function PlayMenuPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Select Game Mode</h1>

      <div className={styles.modeButtons}>
        {/* Single Player vs CPU */}
        <Link href="/play/game?mode=cpu">
          <button className={styles.button}>Player vs CPU</button>
        </Link>

        {/* 1v1 Multiplayer */}
        <p>Coming Soon!</p>
        <Link href="/play/game?mode=1v1">
          <button disabled={true} className={styles.button}>1 vs 1</button>
        </Link>

        {/* 1v1v1v1 Free-for-All */}
        <p>Coming Soon!</p>
        <Link href="/play/game?mode=ffa">
          <button disabled={true} className={styles.button}>1 vs 1 vs 1 vs 1</button>
        </Link>

        {/* Back button to go back to the main menu */}
        <Link href="/menu">
          <button className={`${styles.button} ${styles.backButton}`}>
            Back
          </button>
        </Link>
      </div>
    </div>
  );
}
