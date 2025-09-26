import type { FieldValue } from "firebase/firestore";

export type GameSettings = {
  maxPlayers: number;
  questions: number;
  countdown: number;
  timeLimit: number;
  scoring: {
    correct: number;
    wrong: number;
    bonusPerSecond: number;
  };
};

export type Room = {
  id: string;
  name: string;
  isUse: boolean;
  createdAt: Date;
};

// Nuevo tipo para los estados de sesión
export type SessionState =
  | "waiting"
  | "countdown"
  | "question"
  | "feedback"
  | "podium"
  | "ended";

export type GameSession = {
  id: string;
  roomId: string;
  status: SessionState;
  isOpenToJoin: boolean;
  maxPlayers: number;
  joinedCount: number;
  createdAt: FieldValue | Date;
  startedAt?: FieldValue | Date;
  finishedAt?: FieldValue | Date;

  // Preguntas
  selectedQuestionIds: string[]; // IDs elegidas para esta sesión
  currentQuestionIndex: number; // posición en el array
  currentQuestionId: string; // conveniencia
  questionStartAt: FieldValue | Date | null; // cuando inició la pregunta
};

export type Participant = {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  joinedAt: FieldValue | Date;
  position: number; // 1, 2, 3, 4
};

export type ParticipantAnswer = {
  participantId: string;
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  responseTimeMs: number; // Tiempo en milisegundos desde que se mostró la pregunta
  answeredAt: FieldValue | Date;
  score: number; // Puntuación calculada basada en corrección y tiempo
};

export type SessionWithParticipants = GameSession & {
  participants: Participant[];
  answers?: ParticipantAnswer[]; // Respuestas de todos los participantes
};
