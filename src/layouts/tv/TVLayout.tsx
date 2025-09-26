import { Outlet, useLocation, useNavigate } from "react-router";
import { useTvGame } from "@/hooks/useGame";
import { useRoom } from "@/hooks/useRoom";
import { useEffect } from "react";

import "./TVLayout.css";

export const TVLayout = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { currentRoom, clearRoom } = useTvGame();
  const isLanding = pathname.replace(/\/+$/, "") === "/tv";

  // Suscribirse a cambios en tiempo real de la sala actual
  const { room: liveRoom } = useRoom(currentRoom?.id || null);

  // Detectar cuando isUse cambia a false
  useEffect(() => {
    console.log("liveRoom", liveRoom);
    // Solo ejecutar esta lógica si NO estamos en la página de landing (/tv)
    if (isLanding) return;

    // Si tenemos una sala actual pero la sala en tiempo real indica que isUse es false
    if (currentRoom && liveRoom && liveRoom.isUse === false) {
      console.log("ACA");
      console.log(
        "Room isUse changed to false, clearing room and redirecting to /tv"
      );

      // Limpiar la información de la sala del localStorage
      clearRoom();

      // Redirigir a /tv
      navigate("/tv");
    }
  }, [currentRoom, liveRoom, isLanding, clearRoom, navigate]);

  return (
    <div className={`tv-layout ${!isLanding ? "top-left-logo" : ""}`}>
      {currentRoom && (
        <div className="glass-card room-info font-bold">{currentRoom.name}</div>
      )}
      <Outlet />
    </div>
  );
};
