export type GameSettings = {
  questions: number;
  countdown: number;
  timeLimit: number;
  activityCode: string | null;
  scoring: {
    correct: number;
    wrong: number;
    bonusPerSecond: number;
  };
};
