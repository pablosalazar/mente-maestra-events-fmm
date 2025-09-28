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

export class UserService {
  private static readonly COLLECTION = "users";

  static async getAll(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.COLLECTION));

      return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          avatar: data.avatar,
          documentNumber: data.documentNumber,
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
      // Check if user with this document number already exists
      const existingUser = await this.getByDocumentNumber(
        userData.documentNumber
      );
      if (existingUser) {
        throw new Error("Este usuario ya ha participado de la actividad");
      }

      const docRef = await addDoc(collection(db, this.COLLECTION), {
        ...userData,
        createdAt: Timestamp.now(),
      });

      const newUser: User = {
        id: docRef.id,
        ...userData,
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
        documentNumber: data.documentNumber,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    } catch (error) {
      console.error("Error getting user by document number:", error);
      throw new Error("Error al buscar el usuario");
    }
  }
}
