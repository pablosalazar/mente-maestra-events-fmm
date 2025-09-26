import { createContext, useState, type ReactNode } from "react";
import { useRoomValidation } from "@/hooks/useRoomValidation";
import type { Room } from "@/types";

export interface GameContextType {
  // TV room state
  tvCurrentRoom: Room | null;
  setTvCurrentRoom: (room: Room | null) => void;
  selectTvRoom: (room: Room) => void;
  clearTvRoom: () => void;

  // Tablet room state
  tabletCurrentRoom: Room | null;
  setTabletCurrentRoom: (room: Room | null) => void;
  selectTabletRoom: (room: Room) => void;
  clearTabletRoom: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  // TV room state
  const [tvCurrentRoom, setTvCurrentRoom] = useState<Room | null>(() => {
    try {
      const storedRoom = localStorage.getItem("tvCurrentRoom");
      return storedRoom ? JSON.parse(storedRoom) : null;
    } catch (error) {
      console.error("Error parsing TV room from localStorage:", error);
      return null;
    }
  });

  // Tablet room state
  const [tabletCurrentRoom, setTabletCurrentRoom] = useState<Room | null>(
    () => {
      try {
        const storedRoom = localStorage.getItem("tabletCurrentRoom");
        return storedRoom ? JSON.parse(storedRoom) : null;
      } catch (error) {
        console.error("Error parsing tablet room from localStorage:", error);
        return null;
      }
    }
  );

  // TV room functions
  const selectTvRoom = (room: Room) => {
    setTvCurrentRoom(room);
    localStorage.setItem("tvCurrentRoom", JSON.stringify(room));
  };

  const clearTvRoom = () => {
    setTvCurrentRoom(null);
    localStorage.removeItem("tvCurrentRoom");
  };

  // Tablet room functions
  const selectTabletRoom = (room: Room) => {
    setTabletCurrentRoom(room);
    localStorage.setItem("tabletCurrentRoom", JSON.stringify(room));
  };

  const clearTabletRoom = () => {
    setTabletCurrentRoom(null);
    localStorage.removeItem("tabletCurrentRoom");
  };

  // Validación automática para TV room
  useRoomValidation({
    room: tvCurrentRoom,
    onRoomNotFound: clearTvRoom,
  });

  // Validación automática para Tablet room
  useRoomValidation({
    room: tabletCurrentRoom,
    onRoomNotFound: clearTabletRoom,
  });

  const value: GameContextType = {
    tvCurrentRoom,
    setTvCurrentRoom,
    selectTvRoom,
    clearTvRoom,
    tabletCurrentRoom,
    setTabletCurrentRoom,
    selectTabletRoom,
    clearTabletRoom,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export { GameContext };
