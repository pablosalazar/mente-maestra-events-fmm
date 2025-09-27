import {
  collection,
  addDoc,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firestore";
import type { User, UserCreate } from "@/features/users/types";

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
