// src/store/gameStore.ts
import { create } from "zustand";

/** Returns a random 0–9 for new point cards. */
function getRandomCard(): number {
  return Math.floor(Math.random() * 10);
}

/** Picks 'count' random dream entities from [A,B,C,D,E] (no duplicates). */
function pickRandomDreamEntities(count: number): string[] {
  const allEntities = ["A", "B", "C", "D", "E"];
  const chosen: string[] = [];
  for (let i = 0; i < count; i++) {
    if (allEntities.length === 0) break;
    const idx = Math.floor(Math.random() * allEntities.length);
    chosen.push(allEntities[idx]);
    allEntities.splice(idx, 1);
  }
  return chosen;
}

export interface Player {
  id: string;
  roll: number;             // dice roll 1–6
  insanity: number;         // starts at 100
  wisdom: number;           // starts at 0
  dreamEntities: string[];  // e.g. ["A","B"]
  numberCards: number[];    // always 3 in hand
  isEliminated: boolean;
  usedGuillotineCount?: number;
}

interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  isPlayerAwake: boolean;
  flipInProgress: boolean;
  hasFlippedCoin: boolean;
  hasTakenAction: boolean;
  flipCountdown: number;

  // SCOUT
  scoutEntities: string[] | null;
  scoutCountdown: number;

  // GAMBLER
  gamblerRolling: number;
  gamblerResult: number | null;
  gamblerShowResult: number;

  // GAME OVER
  gameOver: boolean;
  gameOverCountdown: number;
  gameOverMessage: string;
  fadeToBlack: boolean; // if CPU wins => fade to black; if player wins => fade to white

  // ACTIONS
  initGame: () => void;
  flipCoin: () => void;
  nextTurn: () => void;
  gainWisdom: () => void;
  initiateDuel: (playerCard: number) => void;
  useEntityAbility: (entity: string) => void;
  useWisdom: () => void;
  setGameOver: (winner: "player" | "cpu") => void;
  checkElimination: (i1: number, i2: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // INITIAL STATE
  players: [
    {
      id: "player",
      roll: 0,
      insanity: 100,
      wisdom: 0,
      dreamEntities: ["A", "B"],
      numberCards: [0, 2, 7],
      isEliminated: false,
      usedGuillotineCount: 0,
    },
    {
      id: "cpu",
      roll: 0,
      insanity: 100,
      wisdom: 0,
      dreamEntities: ["C", "D"],
      numberCards: [1, 5, 9],
      isEliminated: false,
      usedGuillotineCount: 0,
    },
  ],
  currentPlayerIndex: 0,
  isPlayerAwake: false,
  flipInProgress: false,
  hasFlippedCoin: false,
  hasTakenAction: false,
  flipCountdown: 0,
  scoutEntities: null,
  scoutCountdown: 0,
  gamblerRolling: 0,
  gamblerResult: null,
  gamblerShowResult: 0,
  gameOver: false,
  gameOverCountdown: 0,
  gameOverMessage: "",
  fadeToBlack: false,

  // ACTIONS

  initGame: () => {
    const { players } = get();
    // Reroll dice until there are no ties.
    function rollUntilNoTie(ps: Player[]): Player[] {
      while (true) {
        const updated = ps.map((p) => ({
          ...p,
          roll: Math.floor(Math.random() * 6) + 1,
        }));
        const rolls = updated.map((p) => p.roll);
        if (new Set(rolls).size === updated.length) return updated;
      }
    }
    const noTiePlayers = rollUntilNoTie(players);
    noTiePlayers.sort((a, b) => b.roll - a.roll);
    noTiePlayers.forEach((p) => {
      p.numberCards = [getRandomCard(), getRandomCard(), getRandomCard()];
      p.dreamEntities = pickRandomDreamEntities(2);
      p.insanity = 100;
      p.wisdom = 0;
      p.isEliminated = false;
      p.usedGuillotineCount = 0;
    });
    set({
      players: noTiePlayers,
      currentPlayerIndex: 0,
      isPlayerAwake: false,
      flipInProgress: false,
      hasFlippedCoin: false,
      hasTakenAction: false,
      flipCountdown: 0,
      scoutEntities: null,
      scoutCountdown: 0,
      gamblerRolling: 0,
      gamblerResult: null,
      gamblerShowResult: 0,
      gameOver: false,
      gameOverCountdown: 0,
      gameOverMessage: "",
      fadeToBlack: false,
    });
  },

  flipCoin: () => {
    const { flipInProgress, hasFlippedCoin, gameOver } = get();
    if (gameOver) return;
    if (flipInProgress || hasFlippedCoin) return;
    set({ flipInProgress: true, flipCountdown: 3 });
    const interval = setInterval(() => {
      const { flipCountdown } = get();
      if (flipCountdown <= 1) {
        clearInterval(interval);
        const awake = Math.random() < 0.5;
        set({
          isPlayerAwake: awake,
          flipInProgress: false,
          hasFlippedCoin: true,
          flipCountdown: 0,
        });
      } else {
        set({ flipCountdown: flipCountdown - 1 });
      }
    }, 1000);
  },

  nextTurn: () => {
    const { currentPlayerIndex, players, gameOver } = get();
    if (gameOver) return;
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    set({
      currentPlayerIndex: nextIndex,
      isPlayerAwake: false,
      flipInProgress: false,
      hasFlippedCoin: false,
      hasTakenAction: false,
      flipCountdown: 0,
      scoutEntities: null,
      scoutCountdown: 0,
      gamblerRolling: 0,
      gamblerResult: null,
      gamblerShowResult: 0,
    });
  },

  gainWisdom: () => {
    const { players, currentPlayerIndex, isPlayerAwake, hasTakenAction, gameOver } = get();
    if (gameOver) return;
    if (!isPlayerAwake || hasTakenAction) return;
    const updated = [...players];
    updated[currentPlayerIndex].wisdom += 1;
    set({ players: updated, hasTakenAction: true });
  },

  initiateDuel: (playerCard: number) => {
    const { currentPlayerIndex, players, hasTakenAction, isPlayerAwake, gameOver } = get();
    if (gameOver) return;
    if (!isPlayerAwake || hasTakenAction) return;
    const updated = [...players];
    const player = updated[currentPlayerIndex];
    const oppIndex = (currentPlayerIndex + 1) % updated.length;
    const opponent = updated[oppIndex];
    // Opponent (CPU) picks a random card.
    const cpuIndex = Math.floor(Math.random() * opponent.numberCards.length);
    const cpuCard = opponent.numberCards[cpuIndex];
    if (playerCard > cpuCard) {
      opponent.insanity = Math.max(opponent.insanity - 10, 0);
    } else if (cpuCard > playerCard) {
      player.insanity = Math.max(player.insanity - 10, 0);
    }
    player.numberCards = player.numberCards.filter((c) => c !== playerCard);
    opponent.numberCards.splice(cpuIndex, 1);
    // Refill to 3 cards each.
    while (player.numberCards.length < 3) {
      player.numberCards.push(getRandomCard());
    }
    while (opponent.numberCards.length < 3) {
      opponent.numberCards.push(getRandomCard());
    }
    set({ players: updated, hasTakenAction: true });
    get().checkElimination(currentPlayerIndex, oppIndex);
  },

  useEntityAbility: (entity: string) => {
    const { currentPlayerIndex, players, isPlayerAwake, hasTakenAction, gameOver } = get();
    if (gameOver) return;
    if (!isPlayerAwake || hasTakenAction) return;
    const updated = [...players];
    const player = updated[currentPlayerIndex];
    const oppIndex = (currentPlayerIndex + 1) % updated.length;
    const opponent = updated[oppIndex];

    switch (entity) {
      case "A": { // Wisdom Eater
        // Even if opponent has 0 wisdom, action is consumed.
        if (opponent.wisdom > 0) {
          opponent.wisdom -= 1;
          player.wisdom += 1;
        }
        set({ players: updated, hasTakenAction: true });
        get().checkElimination(currentPlayerIndex, oppIndex);
        return;
      }
      case "B": { // Scout
        const oppEntities = [...opponent.dreamEntities];
        set({ scoutEntities: oppEntities, scoutCountdown: 5 });
        const interval = setInterval(() => {
          const { scoutCountdown } = get();
          if (scoutCountdown <= 1) {
            clearInterval(interval);
            set({ scoutEntities: null, scoutCountdown: 0 });
          } else {
            set({ scoutCountdown: scoutCountdown - 1 });
          }
        }, 1000);
        player.dreamEntities = player.dreamEntities.filter((e) => e !== "B");
        set({ players: updated, hasTakenAction: true });
        get().checkElimination(currentPlayerIndex, oppIndex);
        return;
      }
      case "C": { // Gambler
        if (!player.isEliminated && !opponent.isEliminated) {
          set({ gamblerRolling: 3, gamblerResult: null, gamblerShowResult: 0 });
          const rollInterval = setInterval(() => {
            const { gamblerRolling } = get();
            if (gamblerRolling <= 1) {
              clearInterval(rollInterval);
              const dice = Math.floor(Math.random() * 6) + 1;
              if (dice % 2 === 0) {
                player.wisdom += 2;
              } else {
                player.insanity = Math.max(player.insanity - 20, 0);
              }
              set({ gamblerResult: dice, gamblerRolling: 0, gamblerShowResult: 3 });
              const showInterval = setInterval(() => {
                const { gamblerShowResult } = get();
                if (gamblerShowResult <= 1) {
                  clearInterval(showInterval);
                  set({
                    players: updated,
                    gamblerResult: null,
                    gamblerShowResult: 0,
                    hasTakenAction: true,
                  });
                  get().checkElimination(currentPlayerIndex, oppIndex);
                } else {
                  set({ gamblerShowResult: gamblerShowResult - 1 });
                }
              }, 1000);
            } else {
              set({ gamblerRolling: gamblerRolling - 1 });
            }
          }, 1000);
        }
        return;
      }
      case "D": { // Gift
        player.numberCards.push(getRandomCard());
        while (player.numberCards.length > 3) {
          const discardIndex = Math.floor(Math.random() * player.numberCards.length);
          player.numberCards.splice(discardIndex, 1);
        }
        set({ players: updated, hasTakenAction: true });
        get().checkElimination(currentPlayerIndex, oppIndex);
        return;
      }
      case "E": { // Guillotine
        if (!player.usedGuillotineCount) player.usedGuillotineCount = 0;
        if (player.usedGuillotineCount >= 2) {
          set({ players: updated, hasTakenAction: true });
          return;
        }
        player.usedGuillotineCount++;
        const coin = Math.random() < 0.5;
        if (coin) {
          player.insanity = Math.max(player.insanity - 50, 0);
        } else {
          opponent.insanity = Math.max(opponent.insanity - 50, 0);
        }
        if (player.usedGuillotineCount >= 2) {
          player.dreamEntities = player.dreamEntities.filter((e) => e !== "E");
        }
        set({ players: updated, hasTakenAction: true });
        get().checkElimination(currentPlayerIndex, oppIndex);
        return;
      }
      default:
        return;
    }
  },

  useWisdom: () => {
    const { currentPlayerIndex, players, isPlayerAwake, hasTakenAction, gameOver } = get();
    if (gameOver) return;
    if (!isPlayerAwake || hasTakenAction) return;
    const updated = [...players];
    const player = updated[currentPlayerIndex];
    const oppIndex = (currentPlayerIndex + 1) % updated.length;
    const opponent = updated[oppIndex];
    if (player.wisdom < 5) return;
    player.wisdom -= 5;
    if (opponent.dreamEntities.length > 0) {
      const randIndex = Math.floor(Math.random() * opponent.dreamEntities.length);
      opponent.dreamEntities.splice(randIndex, 1);
    }
    set({ players: updated, hasTakenAction: true });
    get().checkElimination(currentPlayerIndex, oppIndex);
  },

  setGameOver: (winner: "player" | "cpu") => {
    const { gameOver } = get();
    if (gameOver) return;
    let message =
      winner === "player"
        ? "You awake from your sleep paralysis!"
        : "You succumbed to sleep paralysis...";
    const fadeToBlack = winner === "cpu";
    set({
      gameOver: true,
      gameOverCountdown: 5,
      gameOverMessage: message,
      fadeToBlack,
    });
    const interval = setInterval(() => {
      const { gameOverCountdown } = get();
      if (gameOverCountdown <= 1) {
        clearInterval(interval);
        set({ gameOverCountdown: 0 });
      } else {
        set({ gameOverCountdown: gameOverCountdown - 1 });
      }
    }, 1000);
  },

  checkElimination: (i1: number, i2: number) => {
    const store = get();
    const updatedPlayers = [...store.players];
    const p1 = updatedPlayers[i1];
    const p2 = updatedPlayers[i2];

    if (p1.dreamEntities.length === 0) {
      p1.insanity = 0;
      p1.isEliminated = true;
    }
    if (p2.dreamEntities.length === 0) {
      p2.insanity = 0;
      p2.isEliminated = true;
    }
    if (p1.insanity <= 0) {
      p1.insanity = 0;
      p1.isEliminated = true;
    }
    if (p2.insanity <= 0) {
      p2.insanity = 0;
      p2.isEliminated = true;
    }

    if (p1.isEliminated && !p2.isEliminated) {
      store.setGameOver("cpu");
    } else if (p2.isEliminated && !p1.isEliminated) {
      store.setGameOver("player");
    }

    set({ players: updatedPlayers });
  },
}));
