import { Loader } from "@/components/loader/Loader";
import { useTvGame } from "@/hooks/useGame";
import { useTvSession } from "@/hooks/useTvSession";
import { useQuestions } from "@/hooks/useQuestions";
import { getAvatarFromPath } from "@/utils/avatars";
import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function TvWaitingRoom() {
  const navigate = useNavigate();
  const { currentRoom } = useTvGame();
  const { session, isLoading, error, updateSessionAsync } = useTvSession({
    roomId: currentRoom?.id || null,
  });

  // Add the useQuestions hook with roomId
  const {
    selectQuestionsForSession,
    isSelectingQuestions,
    error: questionsError,
  } = useQuestions(currentRoom?.id || "");

  const players = session?.participants || [];

  useEffect(() => {
    if (!currentRoom) {
      navigate("/tv");
      return;
    }

    if (error && !isLoading) {
      navigate("/tv");
    }
  }, [currentRoom, error, isLoading, navigate]);

  useEffect(() => {
    if (
      session &&
      session.joinedCount >= session.maxPlayers &&
      session.isOpenToJoin === true
    ) {
      const handleSessionComplete = async () => {
        try {
          // Select questions using the hook with roomId
          await selectQuestionsForSession(session.id);

          // Update session status
          await updateSessionAsync({
            status: "countdown",
            isOpenToJoin: false,
          });

          navigate("/tv/contador");
        } catch (err) {
          console.error("Error updating session:", err);
        }
      };

      handleSessionComplete();
    }
  }, [session, navigate, updateSessionAsync, selectQuestionsForSession]);

  if (error || questionsError) {
    return (
      <section className="screen-player">
        <div className="glass-card mx-auto text-sm font-bold italic text-red-700 mb-2">
          Error: {error || questionsError}
        </div>
      </section>
    );
  }

  return (
    <>
      {session && (
        <section className="screen-player">
          {(isLoading || isSelectingQuestions) && (
            <Loader
              message={
                isSelectingQuestions
                  ? "Seleccionando preguntas..."
                  : "Conectando a la sesión..."
              }
            />
          )}
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
