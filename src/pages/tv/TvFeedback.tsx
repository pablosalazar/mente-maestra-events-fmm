import { useTvGame } from "@/hooks/useGame";
import { useTvSession } from "@/hooks/useTvSession";
import { useQuestions } from "@/hooks/useQuestions";
import { useAnswers } from "@/hooks/useAnswers";
import { getAvatarFromPath } from "@/utils/avatars";
import { Loader } from "@/components/loader/Loader";
import { Check, X, Clock, Trophy, Minus } from "lucide-react";
import clsx from "clsx";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";

function TvFeedback() {
  const navigate = useNavigate();
  const { currentRoom } = useTvGame();
  const { session, updateSessionAsync } = useTvSession({
    roomId: currentRoom?.id || null,
  });
  const { currentQuestion, currentQuestionIndex, selectedQuestionIds } =
    useQuestions(currentRoom?.id || "");
  const { answers, isLoading, error } = useAnswers({
    roomId: currentRoom?.id || "",
    sessionId: session?.id || "",
    questionId: currentQuestion?.id || "",
  });

  const [countdown, setCountdown] = useState(10);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Lógica de 10 segundos y transición
  useEffect(() => {
    if (!session || !currentQuestion || isLoading) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTransition();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, currentQuestion, isLoading]);

  const handleTransition = async () => {
    if (isTransitioning || !session) return;

    setIsTransitioning(true);

    try {
      const nextQuestionIndex = currentQuestionIndex + 1;

      // Si hemos completado las 5 preguntas, ir al podium
      if (nextQuestionIndex >= 5) {
        await updateSessionAsync({
          status: "podium",
        });
        navigate("/tv/podium");
        return;
      }

      // Obtener el ID de la siguiente pregunta
      const nextQuestionId = selectedQuestionIds[nextQuestionIndex];

      if (!nextQuestionId) {
        console.error("No se encontró la siguiente pregunta");
        return;
      }

      // Actualizar la sesión con la siguiente pregunta
      await updateSessionAsync({
        currentQuestionIndex: nextQuestionIndex,
        currentQuestionId: nextQuestionId,
        status: "countdown",
      });

      // Redirigir al contador
      navigate("/tv/contador");
    } catch (error) {
      console.error("Error en la transición:", error);
    } finally {
      setIsTransitioning(false);
    }
  };

  const formatTime = (timeMs: number) => {
    return `${(timeMs / 1000).toFixed(3)}s`;
  };

  // Crear lista completa de participantes con sus respuestas
  const allParticipants =
    session?.participants.map((participant) => {
      const answer = answers.find(
        (a) => a.participantId === participant.userId
      );
      return {
        participant,
        answer,
        hasAnswered: !!answer,
      };
    }) || [];

  // Ordenar: primero los que respondieron (por score), luego los que no respondieron
  const sortedParticipants = allParticipants.sort((a, b) => {
    if (a.hasAnswered && !b.hasAnswered) return -1;
    if (!a.hasAnswered && b.hasAnswered) return 1;
    if (a.hasAnswered && b.hasAnswered) {
      return (b.answer?.score || 0) - (a.answer?.score || 0);
    }
    return 0;
  });

  if (error) {
    return (
      <div className="glass-card">
        <p className="text-2xl font-bold text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="glass-card">
        <p className="text-2xl font-bold text-[var(--dark-blue)]">
          No hay pregunta disponible
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Contador de transición */}
      {countdown > 0 && (
        <div className="fixed top-20 right-6 bg-[var(--dark-blue)] text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span className="font-bold">
              {currentQuestionIndex + 1 < 5
                ? "Siguiente pregunta en"
                : "Mostrando resultados en"}
              : {countdown}s
            </span>
          </div>
        </div>
      )}

      {isLoading && <Loader message="Cargando resultados..." />}
      {isTransitioning && <Loader message="Preparando siguiente pregunta..." />}

      {/* Grid 2x2 para las tarjetas de participantes */}
      <div className="grid grid-cols-2 gap-6 max-w-5xl mx-auto">
        {sortedParticipants.length > 0 ? (
          sortedParticipants.map(
            ({ participant, answer, hasAnswered }, index) => {
              const isCorrect = answer?.isCorrect;

              return (
                <div
                  key={participant.userId}
                  className={clsx(
                    "relative flex items-center justify-between p-4 rounded-xl border-2 shadow-lg transition-all duration-300",
                    hasAnswered
                      ? isCorrect
                        ? "bg-green-50 border-green-300"
                        : "bg-red-50 border-red-300"
                      : "bg-gray-50 border-gray-300 grayscale"
                  )}
                >
                  {/* Ranking Badge */}
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-[var(--secondary)] border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="font-extrabold text-2xl">{index + 1}</span>
                  </div>

                  {/* Participant Info - Left Side */}
                  <div className="flex items-center space-x-3">
                    <img
                      src={getAvatarFromPath(participant.avatar)}
                      alt={participant.username}
                      className="w-12 h-12 rounded-full border-2 border-white shadow-md"
                    />
                    <div>
                      <p className="font-bold text-lg text-gray-800">
                        {participant.username}
                      </p>
                    </div>
                  </div>

                  {/* Stats - Center */}
                  <div className="flex items-center space-x-4">
                    <div className="text-center flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-blue-600 me-3" />
                      <div>
                        <p className="text-xs text-gray-800 font-bold italic tracking-wide">
                          Tiempo
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          {hasAnswered
                            ? formatTime(answer!.responseTimeMs)
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="text-center flex items-center space-x-1">
                      <Trophy className="w-4 h-4 text-[var(--fuchsia)] me-3" />
                      <div>
                        <p className="text-xs text-gray-800 font-bold italic tracking-wide">
                          Puntos
                        </p>
                        <p className="text-lg font-bold text-[var(--fuchsia)]">
                          {hasAnswered ? answer!.score : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Correct/Incorrect Badge - Right Side */}
                  <div className="flex-shrink-0">
                    {hasAnswered ? (
                      isCorrect ? (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                          <X className="w-5 h-5 text-white" />
                        </div>
                      )
                    ) : (
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center shadow-lg">
                        <Minus className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          )
        ) : (
          <div className="col-span-2 text-center py-8">
            <p className="text-xl text-gray-500">
              No hay participantes o respuestas para mostrar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TvFeedback;
