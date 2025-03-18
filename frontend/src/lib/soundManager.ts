// src/lib/soundManager.ts
import { useEffect, useRef } from "react";

/**
 * useBackgroundMusic - plays a looping background music.
 * @param src - path to the audio file (in public folder)
 * @param loop - whether to loop the audio (default true)
 * @param volume - volume level (0 to 1)
 */
export function useBackgroundMusic(src: string, loop = true, volume = 1) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.loop = loop;
      audioRef.current.volume = volume;
    } else {
      audioRef.current.volume = volume;
    }
    audioRef.current.play().catch((err) => {
      console.error("Error playing background music:", err);
    });
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [src, loop, volume]);
  return audioRef.current;
}

/**
 * useSoundEffect - returns a function to play a sound effect.
 * @param src - path to the audio file (in public folder)
 * @param volume - volume level (0 to 1)
 */
export function useSoundEffect(src: string, volume = 1) {
  const playSound = () => {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch((err) => {
      console.error("Error playing sound effect:", err);
    });
  };
  return playSound;
}
