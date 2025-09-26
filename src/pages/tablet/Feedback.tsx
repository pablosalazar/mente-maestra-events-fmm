import { useTabletGame } from "@/hooks/useGame";
import { useSession } from "@/hooks/useSession";
import { useQuestions } from "@/hooks/useQuestions";
import { useAnswers } from "@/hooks/useAnswers";
import { useAuth } from "@/hooks/useAuth";
import { getAvatarFromPath } from "@/utils/avatars";
import { Loader } from "@/components/loader/Loader";
import { Check, X, Clock, Trophy, AlertCircle } from "lucide-react";
import clsx from "clsx";
import { useNavigate } from "react-router";
import { useEffect } from "react";

function Feedback() {
  const navigate = useNavigate();
  const { currentRoom } = useTabletGame();
  const { user } = useAuth();
  const { session } = useSession({
    roomId: currentRoom?.id || null,
    user,
  });
  const { currentQuestion } = useQuestions(currentRoom?.id || "");
  const { answers, isLoading, error } = useAnswers({
    roomId: currentRoom?.id || "",
    sessionId: session?.id || "",
    questionId: currentQuestion?.id || "",
  });

  // Navegación automática cuando el estado cambia a countdown
  useEffect(() => {
    if (session?.status === "countdown") {
      navigate("/contador");
    }
    if (session?.status === "podium") {
      navigate("/podium");
    }
  }, [session?.status, navigate]);

  const formatTime = (timeMs: number) => {
    return `${(timeMs / 1000).toFixed(3)}s`;
  };

  // Encontrar la respuesta del usuario actual
  const userAnswer = answers.find(
    (answer) => answer.participantId === user?.id
  );
  const participant = session?.participants.find((p) => p.userId === user?.id);

  // Determinar el ranking del usuario
  const sortedAnswers = [...answers].sort((a, b) => b.score - a.score);
  const userRank =
    sortedAnswers.findIndex((answer) => answer.participantId === user?.id) + 1;

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card">
          <p className="text-2xl font-bold text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card">
          <p className="text-2xl font-bold text-[var(--dark-blue)]">
            No hay pregunta disponible
          </p>
        </div>
      </div>
    );
  }

  const hasAnswered = !!userAnswer;
  const isCorrect = userAnswer?.isCorrect || false;

  return (
    <>
      {isLoading ? (
        <Loader message="Cargando tu resultado..." />
      ) : (
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="w-full max-w-lg">
            {/* Tarjeta del usuario */}
            <div
              className={clsx(
                "relative p-8 rounded-2xl border-4 shadow-lg transition-all duration-500 transform hover:scale-105",
                !hasAnswered
                  ? "bg-gray-100 border-gray-400"
                  : isCorrect
                  ? "bg-green-50 border-green-400"
                  : "bg-red-50 border-red-400"
              )}
            >
              {/* Ranking Badge */}
              {hasAnswered && (
                <div
                  className={clsx(
                    "absolute -top-6 -right-6 w-12 h-12 border-4 border-white rounded-full flex items-center justify-center shadow-xl",
                    isCorrect ? "bg-green-500" : "bg-red-500"
                  )}
                >
                  <span className="text-white font-bold text-lg">
                    #{userRank}
                  </span>
                </div>
              )}

              {/* Nivel Superior: Avatar y Nombre */}
              <div className="flex flex-col items-center space-y-4 mb-8">
                {participant && (
                  <>
                    <img
                      src={getAvatarFromPath(participant.avatar)}
                      alt={participant.username}
                      className={clsx(
                        "w-24 h-24 rounded-full border-4 border-white shadow-lg",
                        !hasAnswered && "grayscale opacity-70"
                      )}
                    />
                    <div className="text-center">
                      <h2
                        className={clsx(
                          "text-2xl font-bold",
                          !hasAnswered ? "text-gray-500" : "text-gray-800"
                        )}
                      >
                        {participant.username}
                      </h2>
                      {!hasAnswered && (
                        <p className="text-lg text-gray-500 italic mt-2">
                          No respondiste a tiempo
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Nivel Inferior: Estadísticas en las esquinas */}
              {hasAnswered && userAnswer ? (
                <div className="flex justify-between items-end">
                  {/* Tiempo - Esquina Izquierda */}
                  <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-md">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                        Tiempo
                      </p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatTime(userAnswer.responseTimeMs)}
                      </p>
                    </div>
                  </div>

                  {/* Score - Esquina Derecha */}
                  <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-md">
                    <Trophy className="w-6 h-6 text-[var(--fuchsia)]" />
                    <div>
                      <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                        Puntos
                      </p>
                      <p className="text-xl font-bold text-[var(--fuchsia)]">
                        {userAnswer.score}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mensaje para usuarios que no respondieron */
                <div className="flex justify-center">
                  <div className="flex items-center space-x-3 bg-gray-200/80 backdrop-blur-sm rounded-xl p-4 shadow-md">
                    <AlertCircle className="w-8 h-8 text-gray-500" />
                    <div>
                      <p className="text-lg font-bold text-gray-600">
                        Sin respuesta
                      </p>
                      <p className="text-sm text-gray-500">0 puntos</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Icono de resultado centrado */}
              <div className="absolute top-4 left-4">
                {!hasAnswered ? (
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                ) : isCorrect ? (
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <X className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Mensaje motivacional */}
            <div className="mt-6 text-center">
              {hasAnswered ? (
                isCorrect ? (
                  <p className="text-lg font-semibold text-green-600">
                    ¡Excelente! Respuesta correcta 🎉
                  </p>
                ) : (
                  <p className="text-lg font-semibold text-red-600">
                    Respuesta incorrecta, ¡sigue intentando! 💪
                  </p>
                )
              ) : (
                <p className="text-lg font-semibold text-gray-500">
                  ¡La próxima vez responde más rápido! ⏰
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Feedback;
