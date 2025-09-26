import type { Room } from "@/types";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  subscribeToRooms,
  reserveRoom,
  releaseRoom,
} from "@/services/room.service";
import { toast } from "sonner";

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToRooms(
      (updatedRooms) => {
        setRooms(updatedRooms);
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
  }, []);

  const reserveMutation = useMutation({
    mutationFn: reserveRoom,
    onError: (error) => {
      toast.error(`Failed to reserve room: ${error.message}`);
    },
  });

  const releaseMutation = useMutation({
    mutationFn: releaseRoom,
    onSuccess: () => {
      // No need to invalidate queries - real-time updates handle this!
      toast.success("Sala liberada con éxito!");
    },
    onError: (error) => {
      toast.error(`Failed to release room: ${error.message}`);
    },
  });

  return {
    // Real-time data
    rooms,
    isLoading,
    isError,
    error,

    // Promise-based mutation functions
    reserveRoom: reserveMutation.mutateAsync,
    releaseRoom: releaseMutation.mutateAsync,

    // Mutation states
    isReserving: reserveMutation.isPending,
    isReleasing: releaseMutation.isPending,
    isMutating: reserveMutation.isPending || releaseMutation.isPending,
  };
}
