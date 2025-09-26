import type { Room } from "@/types";
import { useState, useEffect } from "react";
import { subscribeToRoom } from "@/services/room.service";

export function useRoom(roomId: string | null) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roomId) {
      setRoom(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToRoom(
      roomId,
      (updatedRoom) => {
        setRoom(updatedRoom);
        setIsLoading(false);
        setIsError(false);
        setError(null);
      },
      (subscriptionError) => {
        setIsError(true);
        setError(subscriptionError);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  return {
    room,
    isLoading,
    isError,
    error,
  };
}
