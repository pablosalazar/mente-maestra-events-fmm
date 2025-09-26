import { db } from "@/lib/firestore";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";

interface UserScore {
  id: string;
  userId: string;
  userDocument: string;
  roomId: string;
  sessionId: string;
  totalScore: number;
  position: number;
  totalTimeMs: number;
  createdAt: Date;
  correctAnswers: number;
}

// Guardar score del usuario
export const saveUserScore = async (
  scoreData: Omit<UserScore, "id" | "createdAt">
) => {
  try {
    const docRef = await addDoc(collection(db, "usersScore"), {
      ...scoreData,
      createdAt: new Date(),
    });
    console.log("User score saved with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving user score:", error);
    throw error;
  }
};

// Obtener historial de scores de un usuario
export const getUserScoreHistory = async (userId: string) => {
  try {
    const q = query(
      collection(db, "usersScore"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as UserScore)
    );
  } catch (error) {
    console.error("Error getting user score history:", error);
    throw error;
  }
};

// Obtener leaderboard de una sala
export const getRoomLeaderboard = async (roomId: string) => {
  try {
    const q = query(
      collection(db, "usersScore"),
      where("roomId", "==", roomId),
      orderBy("totalScore", "desc"),
      limit(10)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as UserScore)
    );
  } catch (error) {
    console.error("Error getting room leaderboard:", error);
    throw error;
  }
};

// Obtener todos los userScore
export const getAllUserScores = async () => {
  try {
    const q = query(
      collection(db, "usersScore"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as UserScore)
    );
  } catch (error) {
    console.error("Error getting all user scores:", error);
    throw error;
  }
};

// Verificar si un usuario ya ha jugado usando su número de documento
export const checkUserAlreadyPlayed = async (userDocument: string): Promise<boolean> => {
  try {
    const q = query(
      collection(db, "usersScore"),
      where("userDocument", "==", userDocument),
      limit(1)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking if user already played:", error);
    throw error;
  }
};
