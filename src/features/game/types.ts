import type { UserAnswer } from "@/contexts/GameResultsContext";

export interface GameResult {
  id?: string;
  userId: string;
  userDocumentNumber: string;
  activityCode: string | null;
  answers: UserAnswer[];
  totalScore: number;
  correctAnswers: number;
  totalQuestions: number;
  totalTimeMs: number;
  completedAt: Date;
}

export interface GameResultCreate
  extends Omit<GameResult, "id" | "completedAt"> {
  completedAt?: Date;
}
