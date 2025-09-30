import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firestore";
import type { GameResult, GameResultCreate } from "../types";

export class GameService {
  private static readonly COLLECTION = "game-results";

  static async saveGameResult(gameResult: GameResultCreate): Promise<string> {
    try {
      const docData = {
        ...gameResult,
        completedAt: Timestamp.fromDate(gameResult.completedAt || new Date()),
        // Convertir las fechas de las respuestas si es necesario
        answers: gameResult.answers.map((answer) => ({
          ...answer,
          // Asegurar que todos los campos estén presentes
        })),
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), docData);
      return docRef.id;
    } catch (error) {
      console.error("Error saving game result:", error);
      throw new Error("Failed to save game result");
    }
  }

  static async getUserResults(userId: string): Promise<GameResult[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where("userId", "==", userId),
        orderBy("completedAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt.toDate(),
      })) as GameResult[];
    } catch (error) {
      console.error("Error fetching user results:", error);
      throw new Error("Failed to fetch user results");
    }
  }

  static async getTopResults(
    activityCode: string,
    limitCount: number = 10
  ): Promise<GameResult[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where("activityCode", "==", activityCode),
        orderBy("totalScore", "desc"),
        orderBy("totalTimeMs", "asc"), // En caso de empate, el más rápido gana
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt.toDate(),
      })) as GameResult[];
    } catch (error) {
      console.error("Error fetching top results:", error);
      throw new Error("Failed to fetch top results");
    }
  }

  static async getActivityResults(activityCode: string): Promise<GameResult[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where("activityCode", "==", activityCode),
        orderBy("completedAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt.toDate(),
      })) as GameResult[];
    } catch (error) {
      console.error("Error fetching activity results:", error);
      throw new Error("Failed to fetch activity results");
    }
  }

  static async getAllResults(): Promise<GameResult[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        orderBy("completedAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        completedAt: doc.data().completedAt.toDate(),
      })) as GameResult[];
    } catch (error) {
      console.error("Error fetching all results:", error);
      throw new Error("Failed to fetch all results");
    }
  }
}
