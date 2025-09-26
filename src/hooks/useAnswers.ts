import { useState, useEffect } from "react";
import { subscribeToQuestionAnswers } from "@/services/answers.service";
import type { ParticipantAnswer } from "@/types";

interface UseAnswersOptions {
  roomId: string | null;
  sessionId: string | null;
  questionId: string | null;
}

interface UseAnswersReturn {
  answers: ParticipantAnswer[];
  answeredCount: number;
  isLoading: boolean;
  error: string | null;
}

export function useAnswers({
  roomId,
  sessionId,
  questionId,
}: UseAnswersOptions): UseAnswersReturn {
  const [answers, setAnswers] = useState<ParticipantAnswer[]>([]);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId || !sessionId || !questionId) {
      setAnswers([]);
      setAnsweredCount(0);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = subscribeToQuestionAnswers(
      roomId,
      sessionId,
      questionId,
      (newAnswers, count) => {
        setAnswers(newAnswers);
        setAnsweredCount(count);
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [roomId, sessionId, questionId]);

  return {
    answers,
    answeredCount,
    isLoading,
    error,
  };
}