import { useTabletGame } from "@/hooks/useGame";
import { useRoom } from "@/hooks/useRoom";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "@/hooks/useSession";
import { Loader } from "@/components/loader/Loader";
import { getAvatarFromPath } from "@/utils/avatars";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function WaitingRoom() {
  const navigate = useNavigate();
  const { currentRoom } = useTabletGame();
  const { user } = useAuth();

  console.log("user", user);
  const {
    room: liveRoom,
    isLoading: roomLoading,
    isError,
    error,
  } = useRoom(currentRoom?.id || null);

  const {
    session,
    isLoading: sessionLoading,
    error: sessionError,
    clearError,
  } = useSession({
    roomId: currentRoom?.id || null,
    user,
    autoJoin: liveRoom?.isUse || false,
  });

  console.log(session);

  useEffect(() => {
    if (session && session.status === "countdown") {
      navigate("/contador");
    }
  }, [session, navigate]);

  if (isError) {
    return (
      <div className="text-center text-red-500">
        <p>Error loading room: {error?.message}</p>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="text-center text-red-500">
        <p>Error de sesión: {sessionError}</p>
        <button
          onClick={clearError}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Usar participantes reales de la sesión si están disponibles
  const players = session?.participants || [];

  return (
    <>
      {(roomLoading || sessionLoading) && <Loader message="Cargando sala..." />}

      {!roomLoading && liveRoom?.isUse === false && (
        <p className="glass-card text-2xl font-bold italic text-gray-700">
          La sala no esta asignada...
        </p>
      )}

      {!roomLoading && liveRoom?.isUse && !session && (
        <div className="glass-card text-2xl font-bold italic text-gray-700 text-center">
          <p>Esperando que se cree una sesión...</p>
          <p className="text-lg mt-2">Un momento por favor</p>
        </div>
      )}

      {!roomLoading && liveRoom?.isUse && session && (
        <section className="screen-player">
          <h2 className="display-panel !mt-[-50px]">Participantes</h2>
          <div className="pt-1">
            <div className="grid grid-cols-2 gap-6 max-w-[80%] mx-auto mb-10">
              {players.map((player) => (
                <article
                  key={player.id}
                  className="flex flex-col items-center mx-auto"
                >
                  <figure className="mb-2">
                    <img
                      src={getAvatarFromPath(player.avatar)}
                      alt={player.username}
                      width={100}
                      height={100}
                    />
                  </figure>
                  <p className="font-bold italic">{player.username}</p>
                </article>
              ))}
            </div>
            <div className="glass-card mx-auto text-sm font-bold italic text-gray-700 mb-2">
              {session ? (
                <div>
                  {session.joinedCount < session.maxPlayers
                    ? `El juego iniciara al completar  ${session.maxPlayers} participantes`
                    : "Redireccionando..."}
                </div>
              ) : (
                "Conectando a la sesión..."
              )}
            </div>
            <p className="text-center text-sm font-bold italic text-gray-700">
              Jugadores: {session.joinedCount}/{session.maxPlayers}
            </p>
          </div>
        </section>
      )}
    </>
  );
}
