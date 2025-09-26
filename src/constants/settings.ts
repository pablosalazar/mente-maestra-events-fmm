import type { GameSettings } from "@/types";

export const settings: GameSettings = {
  maxPlayers: 3,
  questions: 5,
  countdown: 5,
  timeLimit: 20,
  scoring: {
    correct: 100,
    wrong: 0,
    bonusPerSecond: 5,
  },
};
