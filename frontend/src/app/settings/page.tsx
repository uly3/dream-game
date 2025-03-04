"use client";
import { useState } from "react";
import Link from "next/link";
import styles from "./Settings.module.css";

export default function SettingsPage() {
  const [musicVolume, setMusicVolume] = useState(50);
  const [soundVolume, setSoundVolume] = useState(50);

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
        <button className={styles.backButton}>
          Back
        </button>
      </Link>
    </div>
  );
}
