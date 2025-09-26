import logosTop from "@/assets/images/tv/logos_top.png";
import menteMaestraLogo from "@/assets/images/mente-maestra-logo.png";
import { useRooms } from "@/hooks/useRooms";
import { Loader } from "@/components/loader/Loader";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { useTvGame } from "@/hooks/useGame";
import { useTvSession } from "@/hooks/useTvSession";
import clsx from "clsx";
import { useNavigate } from "react-router";

const Lobby = () => {
  const navigate = useNavigate();
  const { currentRoom, selectRoom, clearRoom } = useTvGame();
  const { rooms, isLoading, isError, error, reserveRoom, isReserving } =
    useRooms();

  const {
    session,
    isLoading: isSessionLoading,
    error: sessionError,
  } = useTvSession({ roomId: currentRoom?.id || null });

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (isError) {
      toast.error(error?.message);
    }
  }, [isError, error]);

  // Manejar errores de sesión
  useEffect(() => {
    if (sessionError) {
      toast.error(sessionError);
    }
  }, [sessionError]);

  useEffect(() => {
    if (isLoading || isReserving) return;

    if (currentRoom) {
      const room = rooms.find((room) => room.id === currentRoom.id);
      if (!room || room.isUse === false) {
        clearRoom();
      }
    }
  }, [currentRoom, clearRoom, rooms, isReserving, isLoading]);

  useEffect(() => {
    if (session) {
      navigate("/tv/sala-espera");
    }
  }, [session, navigate]);

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  const handleSaveRoom = async () => {
    if (selectedRoomId) {
      await reserveRoom(selectedRoomId);
      const room = rooms.find((room) => room.id === selectedRoomId);
      if (room) {
        selectRoom(room);
      }
    }
  };

  const availableRooms = useMemo(() => {
    return rooms.filter((room) => room.isUse === false);
  }, [rooms]);

  return (
    <>
      {(isLoading || isSessionLoading) && <Loader message="Cargando..." />}
      {isReserving && <Loader message="Reservando sala..." />}
      <img src={logosTop} alt="logos-top" className="logos-top" />
      <section className="mt-[-100px]">
        <img
          src={menteMaestraLogo}
          alt="mente-maestra-logo"
          className="mente-maestra-logo"
        />

        {currentRoom ? (
          <div className="glass-card text-2xl font-bold italic text-[var(--dark-blue)]">
            "Esperando Participantes...
          </div>
        ) : (
          <section className=" mx-auto">
            {isLoading && <Loader message="Cargando salas..." />}
            <h2 className="text-2xl font-bold mb-4 text-center">
              Elige una sala
            </h2>
            {availableRooms.length > 0 ? (
              <>
                <div className="flex justify-center gap-4 mb-6">
                  {availableRooms.map((room) => (
                    <button
                      type="button"
                      key={room.id}
                      onClick={() => handleSelectRoom(room.id)}
                      className={clsx(
                        "w-100 !rounded-lg p-4 text-2xl font-semibold cursor-pointer border-2 border-gray-600 text-gray-600",
                        selectedRoomId === room.id
                          ? "bg-white"
                          : "bg-orange-200"
                      )}
                    >
                      {room.name}
                    </button>
                  ))}
                </div>

                <div className="flex justify-center">
                  <button
                    className="btn btn-primary"
                    disabled={!selectedRoomId}
                    onClick={handleSaveRoom}
                  >
                    Guardar Sala
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500">
                No hay salas disponibles.
              </p>
            )}
          </section>
        )}
      </section>
    </>
  );
};

export default Lobby;
