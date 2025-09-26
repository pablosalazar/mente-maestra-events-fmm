import { db } from "@/lib/firestore";
import type { CreateUser, User, UserWithId } from "@/types";
import { generateUsername } from "@/utils/generateUsername";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc, // Agregar este import
} from "firebase/firestore";

export async function getUserByDocumentNumber(
  documentNumber: string
): Promise<UserWithId | null> {
  try {
    const usersCollection = collection(db, "users");
    const q = query(
      usersCollection,
      where("documentNumber", "==", documentNumber)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    return {
      id: userDoc.id,
      ...(userDoc.data() as User),
    };
  } catch (error) {
    console.error("Error fetching user by document number:", error);
    throw new Error("Error al buscar el usuario");
  }
}

export async function loginUser(documentNumber: string): Promise<UserWithId> {
  try {
    const user = await getUserByDocumentNumber(documentNumber);

    if (!user) {
      throw new Error("Usuario no encontrado. Por favor, regístrese primero.");
    }

    // Update last login timestamp
    const userRef = doc(db, "users", user.id);
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Return user data for successful login
    return user;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Error al iniciar sesión");
  }
}

export async function registerUser(
  data: CreateUser
): Promise<{ success: true; id: string }> {
  try {
    const existingUser = await getUserByDocumentNumber(data.documentNumber);
    if (existingUser) {
      throw new Error("Ya existe un usuario con este número de documento");
    }

    const generatedUsername = generateUsername(data.name, data.documentNumber);

    const usersCollection = collection(db, "users");
    const docRef = await addDoc(usersCollection, {
      ...data,
      avatar: "",
      username: generatedUsername,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLogin: null,
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Hubo un error al registrar el usuario");
  }
}

export async function saveAvatar(
  userId: string,
  avatar: string
): Promise<{ success: true }> {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      avatar,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving avatar:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Hubo un error al guardar el avatar");
  }
}

// Agregar esta nueva función
export async function getTotalUsersCount(): Promise<number> {
  try {
    const usersCollection = collection(db, "users");
    const snapshot = await getDocs(usersCollection);
    return snapshot.size;
  } catch (error) {
    console.error("Error getting total users count:", error);
    throw new Error("Error al obtener el total de usuarios");
  }
}

export async function getUserById(userId: string): Promise<UserWithId | null> {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return null;
    }

    return {
      id: userDoc.id,
      ...(userDoc.data() as User),
    };
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw new Error("Error al buscar el usuario");
  }
}
