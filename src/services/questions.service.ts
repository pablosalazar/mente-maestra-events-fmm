import { questionsV1 } from "@/constants/questionV1";
import { selectRandomQuestionIds } from "@/utils/questions";
import { updateSession, findCurrentSession } from "./session.service";
import { serverTimestamp } from "firebase/firestore";
import type { Question } from "@/types/question.type";

export async function selectQuestionsForSession(
  roomId: string,
  sessionId: string
): Promise<{
  selectedQuestionIds: string[];
  currentQuestionIndex: number;
  currentQuestionId: string;
}> {
  const selectedQuestionIds = selectRandomQuestionIds(questionsV1, 5);

  const sessionUpdates = {
    selectedQuestionIds,
    currentQuestionIndex: 0,
    currentQuestionId: selectedQuestionIds[0],
    questionStartAt: serverTimestamp(),
  };

  await updateSession(roomId, sessionId, sessionUpdates);

  return {
    selectedQuestionIds,
    currentQuestionIndex: 0,
    currentQuestionId: selectedQuestionIds[0],
  };
}

// Nuevo método para cargar datos de sesión
export async function loadSessionQuestions(roomId: string): Promise<{
  selectedQuestionIds: string[];
  currentQuestionIndex: number;
  currentQuestionId: string;
} | null> {
  try {
    const session = await findCurrentSession(roomId);

    if (
      !session ||
      !session.selectedQuestionIds ||
      session.selectedQuestionIds.length === 0
    ) {
      return null;
    }

    return {
      selectedQuestionIds: session.selectedQuestionIds,
      currentQuestionIndex: session.currentQuestionIndex,
      currentQuestionId: session.currentQuestionId,
    };
  } catch (error) {
    console.error("Error loading session questions:", error);
    return null;
  }
}

export function getQuestionById(questionId: string): Question | undefined {
  return questionsV1.find((q) => q.id.toString() === questionId);
}

export function getSelectedQuestions(
  selectedQuestionIds: string[]
): Question[] {
  return selectedQuestionIds
    .map((id) => getQuestionById(id))
    .filter((question): question is Question => question !== undefined);
}
