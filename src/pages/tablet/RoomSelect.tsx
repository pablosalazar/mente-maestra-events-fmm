import { useState } from "react";
import { useNavigate } from "react-router";
import { Loader } from "@/components/loader/Loader";
import { useRooms } from "@/hooks/useRooms";
import clsx from "clsx";
import { useTabletGame } from "@/hooks/useGame";

function RoomSelect() {
  const { rooms, isLoading } = useRooms();
  const { selectRoom } = useTabletGame();
  const navigate = useNavigate();
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const handleSelectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
  };

  const handleSaveRoom = () => {
    if (selectedRoomId) {
      const selectedRoom = rooms.find((room) => room.id === selectedRoomId);
      if (selectedRoom) {
        selectRoom(selectedRoom);
        // Redirect to login page after saving the room
        navigate("/login");
      }
    }
  };

  return (
    <section className=" mx-auto">
      {isLoading && <Loader message="Cargando salas..." />}
      <h2 className="text-h2l font-bold mb-4 text-center">Elige una sala</h2>
      <div className="flex justify-center gap-4 mb-6">
        {rooms.map((room) => (
          <button
            type="button"
            key={room.id}
            onClick={() => handleSelectRoom(room.id)}
            className={clsx(
              "w-100 rounded-md p-4 text-2xl font-semibold cursor-pointer border-2 border-gray-600 text-gray-600",
              selectedRoomId === room.id ? "bg-white" : "bg-orange-200"
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
    </section>
  );
}

export default RoomSelect;
