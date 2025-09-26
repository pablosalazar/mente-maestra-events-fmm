import { Loader } from "@/components/loader/Loader";
import { useGame } from "@/hooks/useGame";
import { useRooms } from "@/hooks/useRooms";
import { deleteNonEndedSessions } from "@/services/session.service";
import { useState } from "react";
import { toast } from "sonner";

export default function ReleaseRooms() {
  const { rooms, isLoading, isError, error, releaseRoom, isReleasing } =
    useRooms();
  const { clearTvRoom, clearTabletRoom } = useGame();
  const [isDeletingSessions, setIsDeletingSessions] = useState(false);
  const [processingRoom, setProcessingRoom] = useState<string | null>(null);

  const releaseSpecificRoom = async (roomName: string) => {
    setProcessingRoom(roomName);
    setIsDeletingSessions(true);

    try {
      // Encontrar la sala por nombre
      const targetRoom = rooms.find((room) => room.name === roomName);

      if (!targetRoom) {
        toast.error(`No se encontró la sala: ${roomName}`);
        return;
      }

      // Eliminar sesiones que no estén en estado 'ended'
      const deleteResult = await deleteNonEndedSessions();

      if (deleteResult.success) {
        toast.success(
          `Se eliminaron ${deleteResult.deletedCount} sesiones activas`
        );
      } else {
        toast.error(`Error eliminando sesiones: ${deleteResult.error}`);
      }

      // Liberar la sala específica
      await releaseRoom(targetRoom.id);

      // Limpiar contextos si es necesario
      clearTvRoom();
      clearTabletRoom();

      toast.success(`${roomName} liberada con éxito`);
    } catch (error) {
      console.error(`Error releasing ${roomName}:`, error);
      toast.error(`Error liberando ${roomName}`);
    } finally {
      setIsDeletingSessions(false);
      setProcessingRoom(null);
    }
  };

  const releaseAllRooms = async () => {
    setIsDeletingSessions(true);

    try {
      // Eliminar sesiones que no estén en estado 'ended'
      const deleteResult = await deleteNonEndedSessions();

      if (deleteResult.success) {
        toast.success(
          `Se eliminaron ${deleteResult.deletedCount} sesiones activas`
        );
      } else {
        toast.error(`Error eliminando sesiones: ${deleteResult.error}`);
      }

      // Liberar todas las salas
      for (const room of rooms) {
        await releaseRoom(room.id);
      }

      clearTvRoom();
      clearTabletRoom();

      toast.success("Todas las salas liberadas con éxito");
    } catch (error) {
      console.error("Error in release process:", error);
      toast.error("Error durante el proceso de liberación");
    } finally {
      setIsDeletingSessions(false);
    }
  };

  if (isLoading) {
    return <Loader message="Cargando salas..." />;
  }

  if (isError) {
    return (
      <div className="text-center text-red-500">
        <p>Error cargando salas: {error?.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary mt-4"
        >
          Recargar
        </button>
      </div>
    );
  }

  const isProcessing = isReleasing || isDeletingSessions;
  const educacionFinancieraRoom = rooms.find(
    (room) => room.name === "Sala Educación Financiera"
  );
  const emprendimientoRoom = rooms.find(
    (room) => room.name === "Sala Emprendimiento"
  );

  return (
    <>
      {isProcessing && (
        <Loader
          message={
            processingRoom
              ? `Liberando ${processingRoom}...`
              : "Eliminando sesiones y liberando salas..."
          }
        />
      )}

      <div className="flex flex-col items-center justify-center mb-6">
        <h2 className="text-2xl font-bold mb-4">Salas</h2>
        {rooms.length === 0 ? (
          <p className="text-gray-500">No hay salas disponibles</p>
        ) : (
          <ol className="list-disc list-inside space-y-2 text-[var(--dark-blue)]">
            {rooms.map((room) => (
              <li key={room.id}>
                {room.name}
                {" - "}
                <strong>{room.isUse ? "En uso ❌" : "Disponible ✅"}</strong>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="flex flex-col justify-center gap-4 items-center">
        {/* Botón para Sala Educación Financiera */}
        <button
          type="button"
          className="btn bg-[var(--dark-blue)] w-80"
          onClick={() => releaseSpecificRoom("Sala Educación Financiera")}
          disabled={!educacionFinancieraRoom || isProcessing}
        >
          Liberar Sala Educación Financiera
        </button>

        {/* Botón para Sala Emprendimiento */}
        <button
          type="button"
          className="btn bg-[var(--dark-blue)] w-80"
          onClick={() => releaseSpecificRoom("Sala Emprendimiento")}
          disabled={!emprendimientoRoom || isProcessing}
        >
          Liberar Sala Emprendimiento
        </button>

        {/* Botón para liberar todas las salas */}
        <button
          type="button"
          className="btn bg-red-700 w-80"
          onClick={releaseAllRooms}
          disabled={rooms.length === 0 || isProcessing}
        >
          Liberar Todas las Salas
        </button>
      </div>
    </>
  );
}
