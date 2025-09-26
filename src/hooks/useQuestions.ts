import { useState, useCallback, useEffect } from "react";
import {
  selectQuestionsForSession,
  getQuestionById,
  getSelectedQuestions,
  loadSessionQuestions,
} from "@/services/questions.service";
import type { Question } from "@/types/question.type";

interface UseQuestionsReturn {
  isSelectingQuestions: boolean;
  isLoadingQuestions: boolean;
  selectedQuestionIds: string[];
  currentQuestionIndex: number;
  currentQuestionId: string | null;
  currentQuestion: Question | undefined;
  selectedQuestions: Question[];
  selectQuestionsForSession: (sessionId: string) => Promise<void>;
  loadQuestions: () => Promise<void>;
  getQuestionById: (questionId: string) => Question | undefined;
  error: string | null;
}

export function useQuestions(roomId: string): UseQuestionsReturn {
  const [isSelectingQuestions, setIsSelectingQuestions] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const selectQuestions = useCallback(async (sessionId: string) => {
    setIsSelectingQuestions(true);
    setError(null);

    try {
      const result = await selectQuestionsForSession(roomId, sessionId);

      setSelectedQuestionIds(result.selectedQuestionIds);
      setCurrentQuestionIndex(result.currentQuestionIndex);
      setCurrentQuestionId(result.currentQuestionId);
    } catch (err) {
      console.error("Error selecting questions:", err);
      setError(
        err instanceof Error ? err.message : "Error al seleccionar preguntas"
      );
    } finally {
      setIsSelectingQuestions(false);
    }
  }, [roomId]);

  // Nuevo método para cargar preguntas de la sesión
  const loadQuestions = useCallback(async () => {
    if (!roomId) {
      setError("No room ID provided");
      return;
    }

    setIsLoadingQuestions(true);
    setError(null);

    try {
      const sessionData = await loadSessionQuestions(roomId);
      
      if (sessionData) {
        setSelectedQuestionIds(sessionData.selectedQuestionIds);
        setCurrentQuestionIndex(sessionData.currentQuestionIndex);
        setCurrentQuestionId(sessionData.currentQuestionId);
      } else {
        // No hay sesión activa o no tiene preguntas seleccionadas
        setSelectedQuestionIds([]);
        setCurrentQuestionIndex(0);
        setCurrentQuestionId(null);
      }
    } catch (err) {
      console.error("Error loading questions:", err);
      setError(
        err instanceof Error ? err.message : "Error al cargar preguntas"
      );
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [roomId]);

  // Cargar preguntas automáticamente cuando cambia el roomId
  useEffect(() => {
    if (roomId) {
      loadQuestions();
    }
  }, [roomId, loadQuestions]);

  // Computed values
  const currentQuestion = currentQuestionId
    ? getQuestionById(currentQuestionId)
    : undefined;
  const selectedQuestions = getSelectedQuestions(selectedQuestionIds);

  return {
    isSelectingQuestions,
    isLoadingQuestions,
    selectedQuestionIds,
    currentQuestionIndex,
    currentQuestionId,
    currentQuestion,
    selectedQuestions,
    selectQuestionsForSession: selectQuestions,
    loadQuestions,
    getQuestionById,
    error,
  };
}
