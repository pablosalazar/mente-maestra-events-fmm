/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export interface UserAnswer {
  questionId: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  responseTimeMs: number;
  score: number;
}

interface GameResultsContextType {
  answers: UserAnswer[];
  totalScore: number;
  correctAnswers: number;
  totalQuestions: number;
  addAnswer: (answer: UserAnswer) => void;
  resetResults: () => void;
  getAnswerByQuestionId: (questionId: string) => UserAnswer | undefined;
  calculateFinalScore: () => number;
}

const GameResultsContext = createContext<GameResultsContextType | null>(null);

interface GameResultsProviderProps {
  children: ReactNode;
}

export function GameResultsProvider({ children }: GameResultsProviderProps) {
  const [answers, setAnswers] = useState<UserAnswer[]>([]);

  const addAnswer = useCallback((answer: UserAnswer) => {
    setAnswers((prev) => {
      // Check if answer for this question already exists
      const existingIndex = prev.findIndex(
        (a) => a.questionId === answer.questionId
      );

      if (existingIndex >= 0) {
        // Update existing answer
        const updated = [...prev];
        updated[existingIndex] = answer;
        return updated;
      } else {
        // Add new answer
        return [...prev, answer];
      }
    });
  }, []);

  const resetResults = useCallback(() => {
    setAnswers([]);
  }, []);

  const getAnswerByQuestionId = useCallback(
    (questionId: string) => {
      return answers.find((answer) => answer.questionId === questionId);
    },
    [answers]
  );

  const calculateFinalScore = useCallback(() => {
    return answers.reduce((total, answer) => total + answer.score, 0);
  }, [answers]);

  // Calculate derived values
  const totalScore = calculateFinalScore();
  const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
  const totalQuestions = answers.length;

  const contextValue: GameResultsContextType = {
    answers,
    totalScore,
    correctAnswers,
    totalQuestions,
    addAnswer,
    resetResults,
    getAnswerByQuestionId,
    calculateFinalScore,
  };

  return (
    <GameResultsContext.Provider value={contextValue}>
      {children}
    </GameResultsContext.Provider>
  );
}

export function useGameResults() {
  const context = useContext(GameResultsContext);
  if (context === null) {
    throw new Error("useGameResults must be used within a GameResultsProvider");
  }
  return context;
}
