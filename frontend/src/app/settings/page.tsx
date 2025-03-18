// src/app/settings/page.tsx
"use client";
import { useGameStore } from "@/store/gameStore";
import Link from "next/link";
import styles from "./Settings.module.css";
import SoundButton from "@/components/SoundButton";

export default function SettingsPage() {
  const musicVolume = useGameStore((state) => state.musicVolume);
  const soundVolume = useGameStore((state) => state.soundVolume);
  const setMusicVolume = useGameStore((state) => state.setMusicVolume);
  const setSoundVolume = useGameStore((state) => state.setSoundVolume);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Settings</h1>
      <div className={styles.sliderGroup}>
        <label className={styles.sliderLabel}>
          Music Volume: {musicVolume}
          <input
            type="range"
            min={0}
            max={100}
            value={musicVolume}
            onChange={(e) => setMusicVolume(Number(e.target.value))}
          />
        </label>
        <label className={styles.sliderLabel}>
          Sound Volume: {soundVolume}
          <input
            type="range"
            min={0}
            max={100}
            value={soundVolume}
            onChange={(e) => setSoundVolume(Number(e.target.value))}
          />
        </label>
      </div>
      <Link href="/menu">
        <SoundButton
          className={styles.backButton}
          hoverSoundSrc="/Piano_Hover_Effect.wav"
          clickSoundSrc="/Piano_Select_Effect.wav"
        >
          Back
        </SoundButton>
      </Link>
    </div>
  );
}
