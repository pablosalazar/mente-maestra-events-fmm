import { useEffect } from "react";
import { subscribeToRoom } from "@/services/room.service";
import type { Room } from "@/types";

interface UseRoomValidationOptions {
  room: Room | null;
  onRoomNotFound: () => void;
}

export function useRoomValidation({ room, onRoomNotFound }: UseRoomValidationOptions) {
  useEffect(() => {
    if (!room?.id) return;

    const unsubscribe = subscribeToRoom(
      room.id,
      (updatedRoom) => {
        // Si la sala no existe (updatedRoom es null), limpiar
        if (!updatedRoom) {
          console.log(`Room ${room.id} no longer exists, clearing from storage`);
          onRoomNotFound();
        }
      },
      (error) => {
        console.error(`Error validating room ${room.id}:`, error);
        // En caso de error, también limpiar por seguridad
        onRoomNotFound();
      }
    );

    return () => unsubscribe();
  }, [room?.id, onRoomNotFound]);
}