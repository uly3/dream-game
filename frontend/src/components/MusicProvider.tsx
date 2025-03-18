"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useGameStore } from "@/store/gameStore";

/**
 * The MusicProvider manages:
 * - Two Audio elements (menu loop & game loop)
 * - Waits for first user click to allow playback
 * - Switches music based on route: 
 *     /menu, /settings, /play => main menu music
 *     /play/game => game music
 */
export default function MusicProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const musicVolume = useGameStore((s) => s.musicVolume) / 100; // 0–1
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const mainMenuAudioRef = useRef<HTMLAudioElement | null>(null);
  const gameAudioRef = useRef<HTMLAudioElement | null>(null);

  // Create audio objects once on mount
  useEffect(() => {
    mainMenuAudioRef.current = new Audio("/Main_Menu_Loop_Song.wav");
    mainMenuAudioRef.current.loop = true;
    mainMenuAudioRef.current.volume = musicVolume;
    mainMenuAudioRef.current.preload = "auto";

    gameAudioRef.current = new Audio("/Main_Game_Loop_Song.wav");
    gameAudioRef.current.loop = true;
    gameAudioRef.current.volume = musicVolume;
    gameAudioRef.current.preload = "auto";
  }, []);

  // Update volumes whenever musicVolume changes
  useEffect(() => {
    if (mainMenuAudioRef.current) mainMenuAudioRef.current.volume = musicVolume;
    if (gameAudioRef.current) gameAudioRef.current.volume = musicVolume;
  }, [musicVolume]);

  // Listen for first user click so we can call .play()
  useEffect(() => {
    function handleUserClick() {
      setHasUserInteracted(true);
      document.removeEventListener("click", handleUserClick);
    }
    document.addEventListener("click", handleUserClick);
    return () => document.removeEventListener("click", handleUserClick);
  }, []);

  // Switch music based on route, after user interaction
  useEffect(() => {
    if (!hasUserInteracted) return;

    const isGameRoute = pathname.startsWith("/play/game");
    if (isGameRoute) {
      // Pause main menu, start game music
      mainMenuAudioRef.current?.pause();
      mainMenuAudioRef.current!.currentTime = 0;
      gameAudioRef.current?.play().catch((err) => {
        console.warn("Game music play() error:", err);
      });
    } else {
      // Pause game music, start menu music
      gameAudioRef.current?.pause();
      gameAudioRef.current!.currentTime = 0;
      mainMenuAudioRef.current?.play().catch((err) => {
        console.warn("Menu music play() error:", err);
      });
    }
  }, [pathname, hasUserInteracted]);

  return <>{children}</>;
}
