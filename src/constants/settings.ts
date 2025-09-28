import type { GameSettings } from "@/types";

export const settings: GameSettings = {
  questions: 5,
  countdown: 5,
  timeLimit: 20,
  activityCode: null,
  scoring: {
    correct: 100,
    wrong: 0,
    bonusPerSecond: 5,
  },
};
