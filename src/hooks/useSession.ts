import { useState, useEffect, useCallback, useRef } from "react";
import {
  findCurrentSession,
  joinSession,
  leaveSession,
  subscribeToSession,
} from "@/services/session.service";
import type { SessionWithParticipants, UserWithId } from "@/types";

interface UseSessionOptions {
  roomId: string | null;
  user: UserWithId | null;
  autoJoin?: boolean;
  observeOnly?: boolean;
  pollInterval?: number;
}

interface UseSessionReturn {
  session: SessionWithParticipants | null;
  isLoading: boolean;
  error: string | null;
  joinSessionAsync: () => Promise<void>;
  leaveSessionAsync: () => Promise<void>;
  clearError: () => void;
  currentSessionId: string | null;
}

export function useSession({
  roomId,
  user,
  autoJoin = true,
  observeOnly = false,
  pollInterval = 5000,
}: UseSessionOptions): UseSessionReturn {
  const [session, setSession] = useState<SessionWithParticipants | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Función para buscar sesión existente (sin crear)
  const findExistingSessionAsync = useCallback(async () => {
    if (!roomId) {
      setError("Falta ID de sala");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const existingSession = await findCurrentSession(roomId);
      if (existingSession) {
        setCurrentSessionId(existingSession.id);
        // Si encontramos una sesión, detener el polling
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      } else {
        setCurrentSessionId(null);
      }
    } catch (err) {
      console.error("Error finding session:", err);
      setError("Error al buscar sesión");
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  // Función para unirse a una sesión existente
  const joinSessionAsync = useCallback(async () => {
    if (!roomId || !user || !currentSessionId) {
      setError("Faltan datos de sala, usuario o sesión");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const joinResult = await joinSession(roomId, currentSessionId, user);

      if (!joinResult.success) {
        setError(joinResult.error || "Error al unirse a la sesión");
        return;
      }
    } catch (err) {
      console.error("Error joining session:", err);
      setError("Error al unirse a la sesión");
    } finally {
      setIsLoading(false);
    }
  }, [roomId, user, currentSessionId]);

  // Función para salir de una sesión
  const leaveSessionAsync = useCallback(async () => {
    if (!roomId || !user || !currentSessionId) return;

    try {
      const result = await leaveSession(roomId, currentSessionId, user.id);
      if (result.success) {
        setSession(null);
        setCurrentSessionId(null);
      } else {
        setError(result.error || "Error al salir de la sesión");
      }
    } catch (err) {
      console.error("Error leaving session:", err);
      setError("Error al salir de la sesión");
    }
  }, [roomId, user, currentSessionId]);

  // Buscar sesión existente cuando cambian roomId
  useEffect(() => {
    if (!roomId) {
      setSession(null);
      setCurrentSessionId(null);
      // Limpiar polling si no hay roomId
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    // Siempre buscar sesión existente primero
    findExistingSessionAsync();
  }, [roomId, findExistingSessionAsync]);

  // Configurar polling para buscar sesiones periódicamente
  useEffect(() => {
    if (!roomId || currentSessionId) {
      // Si no hay roomId o ya tenemos una sesión, no hacer polling
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    // Iniciar polling solo si no hay sesión actual
    pollIntervalRef.current = setInterval(() => {
      console.log("Buscando sesiones disponibles...");
      findExistingSessionAsync();
    }, pollInterval);

    // Cleanup del intervalo
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [roomId, currentSessionId, pollInterval, findExistingSessionAsync]);

  // Auto-unirse si está habilitado y hay sesión disponible
  useEffect(() => {
    if (!observeOnly && user && autoJoin && currentSessionId) {
      joinSessionAsync();
    }
  }, [observeOnly, user, autoJoin, currentSessionId, joinSessionAsync]);

  // Suscribirse a actualizaciones de sesión
  useEffect(() => {
    if (!roomId || !currentSessionId) return;

    const unsubscribe = subscribeToSession(
      roomId,
      currentSessionId,
      (updatedSession) => {
        setSession(updatedSession);

        // Remove auto-start game logic (lines 198-201)
      },
      (err) => {
        console.error("Error en suscripción a sesión:", err);
        setError("Error de conexión con la sesión");
        setCurrentSessionId(null);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [roomId, currentSessionId]); // Remove startGame from dependencies

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      // Limpiar polling
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      // Salir de la sesión
      if (roomId && currentSessionId && user) {
        leaveSession(roomId, currentSessionId, user.id).catch(console.error);
      }
    };
  }, []);

  return {
    session,
    isLoading,
    error,
    joinSessionAsync,
    leaveSessionAsync,
    clearError,
    currentSessionId,
  };
}
