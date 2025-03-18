// src/app/menu/page.tsx
"use client";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import SoundButton from "@/components/SoundButton";
import { useBackgroundMusic } from "@/lib/soundManager";
import { useGameStore } from "@/store/gameStore";
import styles from "./MainMenu.module.css";

export default function MainMenuPage() {
  // Play Main Menu loop music using the store's musicVolume (converted 0–1)
  //const musicVolume = useGameStore((state) => state.musicVolume) / 100;

  const handleQuit = () => {
    window.close();
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>GAME NULL</h1>
      <div className={styles.buttonGroup}>
        <Link href="/play">
          <SoundButton
            className={styles.menuButton}
            hoverSoundSrc="/Piano_Hover_Effect.wav"
            clickSoundSrc="/Piano_Select_Effect.wav"
          >
            Play Game
          </SoundButton>
        </Link>
        <Link href="/settings">
          <SoundButton
            className={styles.menuButton}
            hoverSoundSrc="/Piano_Hover_Effect.wav"
            clickSoundSrc="/Piano_Select_Effect.wav"
          >
            Settings
          </SoundButton>
        </Link>
        <SoundButton
          className={`${styles.menuButton} ${styles.quitButton}`}
          onClick={handleQuit}
          hoverSoundSrc="/Piano_Hover_Effect.wav"
          clickSoundSrc="/Piano_Select_Effect.wav"
        >
          Quit
        </SoundButton>
      </div>
    </div>
  );
}
