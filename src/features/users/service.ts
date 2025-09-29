import {
  collection,
  addDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firestore";
import type { User, UserCreate, UserUpdate } from "@/features/users/types";
import { generateUsername } from "@/utils/generateUsername";

export class UserService {
  private static readonly COLLECTION = "users";
  private static readonly GAME_RESULTS_COLLECTION = "game-results";

  static async getAll(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.COLLECTION));

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          avatar: data.avatar,
          username: data.username,
          documentNumber: data.documentNumber,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });
    } catch (error) {
      console.error("Error getting all users:", error);
      throw new Error("Error al obtener los usuarios");
    }
  }

  /**
   * Verifica si un usuario tiene resultados de juego guardados para una actividad específica
   */
  static async hasGameResults(userId: string, activityCode?: string): Promise<boolean> {
    try {
      let q;
      
      if (activityCode) {
        // Verificar resultados para una actividad específica
        q = query(
          collection(db, this.GAME_RESULTS_COLLECTION),
          where("userId", "==", userId),
          where("activityCode", "==", activityCode)
        );
      } else {
        // Verificar cualquier resultado del usuario
        q = query(
          collection(db, this.GAME_RESULTS_COLLECTION),
          where("userId", "==", userId)
        );
      }

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking user game results:", error);
      return false; // En caso de error, permitir participar
    }
  }

  /**
   * Verifica si un usuario puede participar en una actividad
   * - Si no existe: puede participar (se creará)
   * - Si existe pero no tiene resultados: puede participar
   * - Si existe y tiene resultados: no puede participar
   */
  static async canParticipate(documentNumber: string, activityCode?: string): Promise<{
    canParticipate: boolean;
    user?: User;
    reason?: string;
  }> {
    try {
      const existingUser = await this.getByDocumentNumber(documentNumber);
      
      if (!existingUser) {
        // Usuario no existe, puede participar
        return { canParticipate: true };
      }

      // Usuario existe, verificar si tiene resultados
      const hasResults = await this.hasGameResults(existingUser.id, activityCode);
      
      if (hasResults) {
        return {
          canParticipate: false,
          user: existingUser,
          reason: "Este usuario ya ha participado en esta actividad"
        };
      }

      // Usuario existe pero no tiene resultados, puede participar
      return {
        canParticipate: true,
        user: existingUser
      };
    } catch (error) {
      console.error("Error checking if user can participate:", error);
      throw new Error("Error al verificar la participación del usuario");
    }
  }

  static async create(userData: UserCreate): Promise<User> {
    try {
      // Verificar si el usuario puede participar
      const participationCheck = await this.canParticipate(userData.documentNumber);
      
      if (!participationCheck.canParticipate) {
        throw new Error(participationCheck.reason || "El usuario no puede participar");
      }

      // Si el usuario ya existe pero puede participar, retornarlo
      if (participationCheck.user) {
        return participationCheck.user;
      }

      // Crear nuevo usuario
      const generatedUsername = generateUsername(
        userData.name,
        userData.documentNumber
      );

      const docRef = await addDoc(collection(db, this.COLLECTION), {
        ...userData,
        username: generatedUsername,
        createdAt: Timestamp.now(),
      });

      const newUser: User = {
        id: docRef.id,
        ...userData,
        username: generatedUsername,
        createdAt: new Date(),
      };

      return newUser;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Error al crear el usuario");
    }
  }

  static async update(id: string, userData: UserUpdate): Promise<User> {
    try {
      // If updating document number, check if it already exists for another user
      if (userData.documentNumber) {
        const existingUser = await this.getByDocumentNumber(
          userData.documentNumber
        );
        if (existingUser && existingUser.id !== id) {
          throw new Error("Ya existe un usuario con este número de documento");
        }
      }

      const docRef = doc(db, this.COLLECTION, id);

      // Check if user exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error("Usuario no encontrado");
      }

      // Update the document
      await updateDoc(docRef, userData);

      // Get the updated user
      const updatedDocSnap = await getDoc(docRef);
      const data = updatedDocSnap.data()!;

      return {
        id: updatedDocSnap.id,
        name: data.name,
        avatar: data.avatar,
        username: data.username,
        documentNumber: data.documentNumber,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Error al actualizar el usuario");
    }
  }

  static async getById(id: string): Promise<User | null> {
    try {
      const docRef = doc(db, this.COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        avatar: data.avatar,
        username: data.username,
        documentNumber: data.documentNumber,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw new Error("Error al obtener el usuario");
    }
  }

  static async getByDocumentNumber(
    documentNumber: string
  ): Promise<User | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where("documentNumber", "==", documentNumber)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        name: data.name,
        avatar: data.avatar,
        username: data.username,
        documentNumber: data.documentNumber,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error("Error getting user by document number:", error);
      throw new Error("Error al buscar el usuario");
    }
  }
}
