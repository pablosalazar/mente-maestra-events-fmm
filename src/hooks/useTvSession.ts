import { useState, useEffect, useCallback } from "react";
import {
  findOrCreateAvailableSession,
  subscribeToSession,
  updateSession,
} from "@/services/session.service";
import type { SessionWithParticipants, GameSession } from "@/types";
import { useSettings } from "./useSettings";

interface UseTvSessionOptions {
  roomId: string | null;
}

interface UseTvSessionReturn {
  session: SessionWithParticipants | null;
  isLoading: boolean;
  error: string | null;
  sessionId: string | null;
  updateSessionAsync: (updates: Partial<GameSession>) => Promise<void>;
}

export function useTvSession({
  roomId,
}: UseTvSessionOptions): UseTvSessionReturn {
  const { settings } = useSettings();
  const [session, setSession] = useState<SessionWithParticipants | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const findSession = useCallback(async () => {
    if (!roomId) {
      setError("No se proporcionó ID de sala");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const availableSession = await findOrCreateAvailableSession(
        roomId,
        settings.maxPlayers
      );
      setSessionId(availableSession.id);
    } catch {
      setError("Error al buscar sesión");
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  // Buscar sesión cuando cambia roomId
  useEffect(() => {
    if (!roomId) {
      setSession(null);
      setSessionId(null);
      setError(null);
      return;
    }

    findSession();
  }, [roomId, findSession]);

  useEffect(() => {
    if (!roomId || !sessionId) return;

    const unsubscribe = subscribeToSession(
      roomId,
      sessionId,
      (updatedSession) => {
        setSession(updatedSession);
      },
      () => {
        setError("Error de conexión con la sesión");
      }
    );

    return () => {
      unsubscribe();
    };
  }, [roomId, sessionId]);

  const updateSessionAsync = useCallback(
    async (updates: Partial<GameSession>) => {
      if (!roomId || !sessionId) {
        setError("Faltan datos de sala o sesión");
        return;
      }

      try {
        const result = await updateSession(roomId, sessionId, updates);
        if (!result.success) {
          setError(result.error || "Error al actualizar la sesión");
        }
      } catch (err) {
        console.error("Error updating session:", err);
        setError("Error al actualizar la sesión");
      }
    },
    [roomId, sessionId]
  );

  return {
    session,
    isLoading,
    error,
    sessionId,
    updateSessionAsync,
  };
}
