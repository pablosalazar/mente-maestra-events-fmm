/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import type { Question } from "@/types/question.type";
import { Outlet } from "react-router";

interface SessionContextType {
  questions: Question[];
  currentQuestionIndex: number;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider() {
  const contextValue: SessionContextType = {
    questions: [],
    currentQuestionIndex: 0,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      <Outlet />
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
