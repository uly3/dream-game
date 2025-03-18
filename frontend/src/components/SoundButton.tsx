// src/components/SoundButton.tsx
"use client";
import React, { ButtonHTMLAttributes } from "react";
import { useSoundEffect } from "@/lib/soundManager";
import { useGameStore } from "@/store/gameStore";

interface SoundButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  hoverSoundSrc: string;
  clickSoundSrc: string;
}

export default function SoundButton({
  hoverSoundSrc,
  clickSoundSrc,
  children,
  ...rest
}: SoundButtonProps) {
  // Get current sound volume from the store (0–100 converted to 0–1)
  const soundVolume = useGameStore((state) => state.soundVolume) / 100;
  const playHover = useSoundEffect(hoverSoundSrc, soundVolume);
  const playClick = useSoundEffect(clickSoundSrc, soundVolume);
  return (
    <button
      {...rest}
      onMouseEnter={(e) => {
        playHover();
        if (rest.onMouseEnter) rest.onMouseEnter(e);
      }}
      onClick={(e) => {
        playClick();
        if (rest.onClick) rest.onClick(e);
      }}
    >
      {children}
    </button>
  );
}
