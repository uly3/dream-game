// src/store/gameStore.ts
import { create } from 'zustand';

export interface Player {
  id: string;               // "player" or "cpu"
  roll: number;             // dice roll 1-6
  insanity: number;         // starts at 100
  wisdom: number;           // starts at 0
  dreamEntities: string[];  // e.g. ["A", "B"]
  numberCards: number[];    // 3 cards
  isEliminated: boolean;    
}

interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  isPlayerAwake: boolean;      
  deck: number[];
  wisdomPile: number;
  flipInProgress: boolean;     // 3-second delay
  hasFlippedCoin: boolean;     // can only flip once per turn
  hasTakenAction: boolean;     // can only do 1 action if awake
  flipCountdown: number; // for the 3-2-1 countdown

  // Actions
  initGame: () => void;
  flipCoin: () => void;
  nextTurn: () => void;
  gainWisdom: () => void;
  initiateDuel: (targetId: string) => void;
  useEntityAbility: (entity: string) => void;
}

const initialDeck = [0,1,2,3,4,5,6,7,8,9];

export const useGameStore = create<GameState>((set, get) => ({
  players: [
    {
      id: 'player',
      roll: 0, // will set later
      insanity: 100,
      wisdom: 0,
      dreamEntities: ['A','B'],
      numberCards: [0,2,7],
      isEliminated: false,
    },
    {
      id: 'cpu',
      roll: 0,
      insanity: 100,
      wisdom: 0,
      dreamEntities: ['C','D'],
      numberCards: [1,5,9],
      isEliminated: false,
    },
  ],
  currentPlayerIndex: 0,
  isPlayerAwake: false,
  deck: [...initialDeck],
  wisdomPile: 10,
  flipInProgress: false,
  hasFlippedCoin: false,
  hasTakenAction: false,
  flipCountdown: 0,

  // 1) Initialize game: random roll (1-6) for each player, sort turn order
  initGame: () => {
    function rollUntilNoTie(players: Player[]): Player[] {
      while (true) {
        // Assign random rolls
        const updated = players.map((p) => ({
          ...p,
          roll: Math.floor(Math.random() * 6) + 1,
        }));
        // Check for duplicates
        const rolls = updated.map((p) => p.roll);
        const uniqueRolls = new Set(rolls);
        if (uniqueRolls.size === updated.length) {
          return updated;
        }
        // Otherwise, loop again
      }
    }

    const current = get().players;
    // Reroll until no ties
    const noTiePlayers = rollUntilNoTie(current);

    // Sort by roll DESC
    noTiePlayers.sort((a, b) => b.roll - a.roll);

    set({
      players: noTiePlayers,
      currentPlayerIndex: 0,
      isPlayerAwake: false,
      flipInProgress: false,
      hasFlippedCoin: false,
      hasTakenAction: false,
      flipCountdown: 0,
    });
  },

  // Coin flip with countdown
  flipCoin: () => {
    const { flipInProgress, hasFlippedCoin } = get();
    if (flipInProgress || hasFlippedCoin) return;

    // Start flipping
    set({ flipInProgress: true, flipCountdown: 3 });

    const interval = setInterval(() => {
      const { flipCountdown } = get();
      if (flipCountdown <= 1) {
        clearInterval(interval);
        // finalize coin result
        const result = Math.random() < 0.5; // awake or asleep
        set({
          isPlayerAwake: result,
          flipInProgress: false,
          hasFlippedCoin: true,
          flipCountdown: 0,
        });
      } else {
        // decrement countdown
        set({ flipCountdown: flipCountdown - 1 });
      }
    }, 1000);
  },

  nextTurn: () => {
    const { currentPlayerIndex, players } = get();
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    set({
      currentPlayerIndex: nextIndex,
      isPlayerAwake: false,
      flipInProgress: false,
      hasFlippedCoin: false,
      hasTakenAction: false,
      flipCountdown: 0,
    });
  },

  // 4) Gain wisdom
  gainWisdom: () => {
    const { players, currentPlayerIndex, isPlayerAwake, wisdomPile, hasTakenAction } = get();
    if (!isPlayerAwake || wisdomPile <= 0 || hasTakenAction) return;

    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex].wisdom += 1;

    set({
      players: updatedPlayers,
      wisdomPile: wisdomPile - 1,
      hasTakenAction: true, // used our 1 action
    });
  },

  initiateDuel: (targetId: string) => {
    // will fill in
  },

  useEntityAbility: (entity: string) => {
    // will fill in
  },
}));
