/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from "react";
import type { Question } from "@/types/question.type";
import { Outlet } from "react-router";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { questionsV1 } from "@/constants/questionV1";
import { selectRandomItems } from "@/utils/questions";
import { GameResultsProvider } from "./GameResultsContext";

interface SessionContextType {
  questions: Question[];
  currentQuestionIndex: number;
  currentQuestion: Question | null;
  isSessionActive: boolean;
  isSessionCompleted: boolean;
  startSession: () => void;
  nextQuestion: () => void;
  resetSession: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider() {
  const { settings } = useSettings();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);

  const startSession = useCallback(() => {
    const questionCount = settings?.questions || 5;
    const selectedQuestions = selectRandomItems(questionsV1, questionCount);
    setQuestions(selectedQuestions);
    setCurrentQuestionIndex(0);
    setIsSessionActive(true);
    setIsSessionCompleted(false);
  }, [settings?.questions]);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Session finished
      setIsSessionActive(false);
      setIsSessionCompleted(true);
    }
  }, [currentQuestionIndex, questions.length]);

  const resetSession = useCallback(() => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setIsSessionActive(false);
    setIsSessionCompleted(false);
  }, []);

  const currentQuestion = questions[currentQuestionIndex] || null;

  const contextValue: SessionContextType = {
    questions,
    currentQuestionIndex,
    currentQuestion,
    isSessionActive,
    isSessionCompleted,
    startSession,
    nextQuestion,
    resetSession,
  };

  return (
    <GameResultsProvider>
      <SessionContext.Provider value={contextValue}>
        <Outlet />
      </SessionContext.Provider>
    </GameResultsProvider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === null) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
