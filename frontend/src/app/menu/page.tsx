"use client"; 
import styles from "./MainMenu.module.css";
import { motion } from "framer-motion";
import Link from "next/link";

export default function MainMenuPage() {
  const handleQuit = () => {
    // In a browser tab, window.close() typically won't do much unless opened via script
    // You could redirect somewhere else or show a modal.
    window.close();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>DREAM GAME</h1>

      <div className={styles.buttonGroup}>
        <Link href="/play">
          <button className={styles.menuButton}>
            Play Game
          </button>
        </Link>

        <Link href="/settings">
          <button className={styles.menuButton}>
            Settings
          </button>
        </Link>

        <button
          className={`${styles.menuButton} ${styles.quitButton}`}
          onClick={handleQuit}
        >
          Quit
        </button>
      </div>
    </div>
  );
}
