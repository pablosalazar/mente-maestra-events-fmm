import { useContext } from "react";
import { GameContext } from "@/contexts/GameContext";

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

// Convenience hooks for specific device types
export function useTvGame() {
  const { tvCurrentRoom, setTvCurrentRoom, selectTvRoom, clearTvRoom } =
    useGame();
  return {
    currentRoom: tvCurrentRoom,
    setCurrentRoom: setTvCurrentRoom,
    selectRoom: selectTvRoom,
    clearRoom: clearTvRoom,
  };
}

export function useTabletGame() {
  const {
    tabletCurrentRoom,
    setTabletCurrentRoom,
    selectTabletRoom,
    clearTabletRoom,
  } = useGame();
  return {
    currentRoom: tabletCurrentRoom,
    setCurrentRoom: setTabletCurrentRoom,
    selectRoom: selectTabletRoom,
    clearRoom: clearTabletRoom,
  };
}
