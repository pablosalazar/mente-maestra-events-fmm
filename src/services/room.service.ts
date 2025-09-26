import { db } from "@/lib/firestore";
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
} from "firebase/firestore";
import type { Room } from "@/types";

export async function getRooms() {
  const roomsRef = collection(db, "rooms");
  const snapshot = await getDocs(roomsRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export function subscribeToRooms(
  onUpdate: (rooms: Room[]) => void,
  onError?: (error: Error) => void
) {
  const roomsRef = collection(db, "rooms");
  const q = query(roomsRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const rooms = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Room[];
      onUpdate(rooms);
    },
    (error) => {
      console.error("Rooms subscription error:", error);
      onError?.(error);
    }
  );
}

export function subscribeToRoom(
  roomId: string,
  onUpdate: (room: Room | null) => void,
  onError?: (error: Error) => void
) {
  const roomRef = doc(db, "rooms", roomId);

  return onSnapshot(
    roomRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const room = {
          id: snapshot.id,
          ...snapshot.data(),
        } as Room;
        onUpdate(room);
      } else {
        onUpdate(null); // Room doesn't exist
      }
    },
    (error) => {
      console.error("Room subscription error:", error);
      onError?.(error);
    }
  );
}

export async function reserveRoom(roomId: string) {
  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, {
    isUse: true,
  });
}

export async function releaseRoom(roomId: string) {
  const roomRef = doc(db, "rooms", roomId);
  await updateDoc(roomRef, {
    isUse: false,
  });
}
