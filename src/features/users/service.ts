import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firestore";
import type { User, UserCreate, UserUpdate } from "@/features/users/types";
import { generateUsername } from "@/utils/generateUsername";

export class UserService {
  private static readonly COLLECTION = "users";

  static async getAll(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          avatar: data.avatar,
          username: data.username,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });
    } catch (error) {
      console.error("Error getting all users:", error);
      throw new Error("Error al obtener los usuarios");
    }
  }

  static async create(userData: UserCreate): Promise<User> {
    try {
      // Crear nuevo usuario
      const generatedUsername = generateUsername(userData.name);
      console.log(generatedUsername);

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
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw new Error("Error al obtener el usuario");
    }
  }
}
