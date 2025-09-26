import { db } from "@/lib/firestore";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDocs,
  type DocumentData,
} from "firebase/firestore";
import type { ParticipantAnswer } from "@/types";

// Enviar respuesta de participante
export async function submitAnswer(
  roomId: string,
  sessionId: string,
  answer: Omit<ParticipantAnswer, "answeredAt">
): Promise<void> {
  try {
    const answersRef = collection(
      db,
      "rooms",
      roomId,
      "sessions",
      sessionId,
      "answers"
    );

    await addDoc(answersRef, {
      ...answer,
      answeredAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    throw error;
  }
}

export function subscribeToQuestionAnswers(
  roomId: string,
  sessionId: string,
  questionId: string,
  onUpdate: (answers: ParticipantAnswer[], answeredCount: number) => void,
  onError?: (error: Error) => void
) {
  const answersRef = collection(
    db,
    "rooms",
    roomId,
    "sessions",
    sessionId,
    "answers"
  );

  const q = query(answersRef, where("questionId", "==", questionId));

  return onSnapshot(
    q,
    (snapshot) => {
      const answers = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          ...data,
        } as unknown as ParticipantAnswer;
      });

      const answeredCount = answers.length;
      onUpdate(answers, answeredCount);
    },
    (error) => {
      console.error("Answers subscription error:", error);
      onError?.(error);
    }
  );
}

export async function getQuestionAnswers(
  roomId: string,
  sessionId: string,
  questionId: string
): Promise<ParticipantAnswer[]> {
  try {
    const answersRef = collection(
      db,
      "rooms",
      roomId,
      "sessions",
      sessionId,
      "answers"
    );

    const q = query(answersRef, where("questionId", "==", questionId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data() as DocumentData;
      return {
        id: doc.id,
        ...data,
      } as unknown as ParticipantAnswer;
    });
  } catch (error) {
    console.error("Error getting question answers:", error);
    throw error;
  }
}

// Get all answers for entire session (for podium)
export async function getAllSessionAnswers(
  roomId: string,
  sessionId: string
): Promise<ParticipantAnswer[]> {
  try {
    const answersRef = collection(
      db,
      "rooms",
      roomId,
      "sessions",
      sessionId,
      "answers"
    );

    const snapshot = await getDocs(answersRef);

    return snapshot.docs.map((doc) => {
      const data = doc.data() as DocumentData;
      return {
        id: doc.id,
        ...data,
      } as unknown as ParticipantAnswer;
    });
  } catch (error) {
    console.error("Error getting all session answers:", error);
    throw error;
  }
}

// Subscribe to all session answers (for real-time podium updates)
export function subscribeToAllSessionAnswers(
  roomId: string,
  sessionId: string,
  onUpdate: (answers: ParticipantAnswer[]) => void,
  onError?: (error: Error) => void
) {
  const answersRef = collection(
    db,
    "rooms",
    roomId,
    "sessions",
    sessionId,
    "answers"
  );

  return onSnapshot(
    answersRef,
    (snapshot) => {
      const answers = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          ...data,
        } as unknown as ParticipantAnswer;
      });

      onUpdate(answers);
    },
    (error) => {
      console.error("All session answers subscription error:", error);
      onError?.(error);
    }
  );
}
