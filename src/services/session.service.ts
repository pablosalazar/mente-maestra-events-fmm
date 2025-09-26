import { db } from "@/lib/firestore";
import {
  collection,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  runTransaction,
  onSnapshot,
  increment,
  addDoc,
  deleteDoc, // Agregar este import
} from "firebase/firestore";
import type {
  GameSession,
  Participant,
  SessionWithParticipants,
} from "@/types";
import type { UserWithId } from "@/types";

// Buscar sesión activa existente (mejorada)
export async function findCurrentSession(
  roomId: string
): Promise<GameSession | null> {
  try {
    const sessionsRef = collection(db, "rooms", roomId, "sessions");

    // Buscar sesiones que NO estén terminadas, ordenadas por fecha de creación (más reciente primero)
    const q = query(
      sessionsRef,
      where("status", "!=", "ended"),
      orderBy("status"), // Necesario para usar != con orderBy
      orderBy("createdAt", "desc"), // Más reciente primero
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const sessionDoc = snapshot.docs[0];
      return {
        id: sessionDoc.id,
        ...sessionDoc.data(),
      } as GameSession;
    }

    return null;
  } catch (error) {
    console.error("Error finding current session:", error);

    // Fallback: si falla la consulta con !=, usar consulta alternativa
    try {
      const sessionsRef = collection(db, "rooms", roomId, "sessions");
      const fallbackQuery = query(
        sessionsRef,
        where("status", "in", [
          "waiting",
          "countdown",
          "question",
          "feedback",
          "podium",
        ]),
        orderBy("createdAt", "desc"),
        limit(1)
      );

      const fallbackSnapshot = await getDocs(fallbackQuery);

      if (!fallbackSnapshot.empty) {
        const sessionDoc = fallbackSnapshot.docs[0];
        return {
          id: sessionDoc.id,
          ...sessionDoc.data(),
        } as GameSession;
      }
    } catch (fallbackError) {
      console.error("Error in fallback query:", fallbackError);
    }

    return null;
  }
}

// Crear nueva sesión
export async function createSession(
  roomId: string,
  maxPlayers: number
): Promise<GameSession> {
  try {
    const sessionsRef = collection(db, "rooms", roomId, "sessions");
    const newSession: Omit<GameSession, "id"> = {
      roomId,
      status: "waiting",
      isOpenToJoin: true,
      maxPlayers,
      joinedCount: 0,
      createdAt: serverTimestamp(),
      // Inicializar campos de preguntas
      selectedQuestionIds: [],
      currentQuestionIndex: -1,
      currentQuestionId: "",
      questionStartAt: null,
    };

    const sessionDoc = await addDoc(sessionsRef, newSession);

    return {
      id: sessionDoc.id,
      ...newSession,
      createdAt: new Date(),
    } as GameSession;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
}

export async function findOrCreateAvailableSession(
  roomId: string,
  maxPlayers: number
): Promise<GameSession> {
  // Primero buscar sesión existente
  const existingSession = await findCurrentSession(roomId);

  if (existingSession) {
    return existingSession;
  }

  // Si no existe, crear nueva sesión
  return await createSession(roomId, maxPlayers);
}

export async function joinSession(
  roomId: string,
  sessionId: string,
  user: UserWithId
): Promise<{ success: boolean; participant?: Participant; error?: string }> {
  try {
    const result = await runTransaction(db, async (transaction) => {
      const sessionRef = doc(db, "rooms", roomId, "sessions", sessionId);
      const sessionDoc = await transaction.get(sessionRef);

      if (!sessionDoc.exists()) {
        throw new Error("La sesión no existe");
      }

      const session = sessionDoc.data() as GameSession;

      // Verificar si la sesión está disponible
      if (session.status !== "waiting" || !session.isOpenToJoin) {
        throw new Error("La sesión no está disponible para unirse");
      }

      // Verificar si hay espacio
      if (session.joinedCount >= session.maxPlayers) {
        throw new Error("La sesión está llena");
      }

      // Verificar si el usuario ya está en la sesión
      const participantsRef = collection(
        db,
        "rooms",
        roomId,
        "sessions",
        sessionId,
        "participants"
      );
      const existingParticipant = await getDocs(
        query(participantsRef, where("userId", "==", user.id))
      );

      // Si el usuario ya está en la sesión, retornar el participante existente
      if (!existingParticipant.empty) {
        const participantDoc = existingParticipant.docs[0];
        return {
          success: true,
          participant: {
            id: participantDoc.id,
            ...participantDoc.data(),
          } as Participant,
        };
      }

      // Crear participante
      const participantRef = doc(participantsRef);
      const participant: Omit<Participant, "id"> = {
        userId: user.id,
        username: user.username || user.name,
        avatar: user.avatar,
        joinedAt: serverTimestamp(),
        position: session.joinedCount + 1,
      };

      // Actualizar sesión y agregar participante
      transaction.set(participantRef, participant);
      transaction.update(sessionRef, {
        joinedCount: increment(1),
      });

      return {
        success: true,
        participant: {
          id: participantRef.id,
          ...participant,
          joinedAt: new Date(),
        } as Participant,
      };
    });

    return result;
  } catch (error) {
    console.error("Error joining session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function leaveSession(
  roomId: string,
  sessionId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await runTransaction(db, async (transaction) => {
      const sessionRef = doc(db, "rooms", roomId, "sessions", sessionId);
      const participantsRef = collection(
        db,
        "rooms",
        roomId,
        "sessions",
        sessionId,
        "participants"
      );

      // Buscar participante
      const participantQuery = query(
        participantsRef,
        where("userId", "==", userId)
      );
      const participantSnapshot = await getDocs(participantQuery);

      if (participantSnapshot.empty) {
        throw new Error("No estás en esta sesión");
      }

      const participantDoc = participantSnapshot.docs[0];

      // Eliminar participante y actualizar contador
      transaction.delete(participantDoc.ref);
      transaction.update(sessionRef, {
        joinedCount: increment(-1),
        isOpenToJoin: true, // Reabrir sesión
      });
    });

    return { success: true };
  } catch (error) {
    console.error("Error leaving session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export function subscribeToSession(
  roomId: string,
  sessionId: string,
  onUpdate: (session: SessionWithParticipants | null) => void,
  onError: (error: Error) => void
) {
  const sessionRef = doc(db, "rooms", roomId, "sessions", sessionId);
  const participantsRef = collection(
    db,
    "rooms",
    roomId,
    "sessions",
    sessionId,
    "participants"
  );

  // Suscribirse a la sesión
  const unsubscribeSession = onSnapshot(
    sessionRef,
    async (sessionDoc) => {
      if (!sessionDoc.exists()) {
        onUpdate(null);
        return;
      }

      // Obtener participantes
      const participantsSnapshot = await getDocs(
        query(participantsRef, orderBy("position", "asc"))
      );

      const participants = participantsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Participant[];

      const session = {
        id: sessionDoc.id,
        ...sessionDoc.data(),
        participants,
      } as SessionWithParticipants;

      onUpdate(session);
    },
    onError
  );

  return unsubscribeSession;
}

export async function updateSession(
  roomId: string,
  sessionId: string,
  updates: Partial<GameSession>
): Promise<{ success: boolean; error?: string }> {
  try {
    const sessionRef = doc(db, "rooms", roomId, "sessions", sessionId);
    await updateDoc(sessionRef, updates);
    return { success: true };
  } catch (error) {
    console.error("Error updating session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

// Buscar la sesión completada más reciente
export async function findMostRecentEndedSession(
  roomId: string
): Promise<GameSession | null> {
  try {
    const sessionsRef = collection(db, "rooms", roomId, "sessions");

    // Buscar sesiones con status "podium" o "ended"
    const q = query(
      sessionsRef,
      where("status", "in", ["podium", "ended"]),
      orderBy("createdAt", "desc"),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const sessionDoc = snapshot.docs[0];
      return {
        id: sessionDoc.id,
        ...sessionDoc.data(),
      } as GameSession;
    }

    return null;
  } catch (error) {
    console.error("Error finding most recent completed session:", error);
    return null;
  }
}

export async function deleteNonEndedSessions(): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  try {
    let deletedCount = 0;

    // Obtener todas las salas
    const roomsRef = collection(db, "rooms");
    const roomsSnapshot = await getDocs(roomsRef);

    // Para cada sala, eliminar sesiones que no estén en estado 'ended'
    for (const roomDoc of roomsSnapshot.docs) {
      const sessionsRef = collection(db, "rooms", roomDoc.id, "sessions");

      // Buscar sesiones que NO estén en estado 'ended'
      const q = query(sessionsRef, where("status", "!=", "ended"));

      const sessionsSnapshot = await getDocs(q);

      // Eliminar cada sesión encontrada
      for (const sessionDoc of sessionsSnapshot.docs) {
        // Primero eliminar todos los participantes de la sesión
        const participantsRef = collection(
          db,
          "rooms",
          roomDoc.id,
          "sessions",
          sessionDoc.id,
          "participants"
        );
        const participantsSnapshot = await getDocs(participantsRef);

        // Eliminar participantes
        for (const participantDoc of participantsSnapshot.docs) {
          await deleteDoc(participantDoc.ref);
        }

        // Luego eliminar la sesión
        await deleteDoc(sessionDoc.ref);
        deletedCount++;

        console.log(
          `🗑️ Deleted session ${sessionDoc.id} from room ${roomDoc.data().name}`
        );
      }
    }

    console.log(`✅ Deleted ${deletedCount} non-ended sessions`);
    return { success: true, deletedCount };
  } catch (error) {
    console.error("❌ Error deleting non-ended sessions:", error);
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
