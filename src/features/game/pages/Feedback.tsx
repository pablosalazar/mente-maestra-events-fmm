import { useGameResults } from "@/contexts/GameResultsContext";
import { useSession } from "@/contexts/SessionContext";
import { useAuth } from "@/hooks/useAuth";
import { getAvatarFromPath } from "@/utils/avatars";
import clsx from "clsx";
import { AlertCircle, Check, Clock, Trophy, X } from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function Feedback() {
  const navigate = useNavigate();

  const { user } = useAuth();
  const { currentQuestion, nextQuestion } = useSession();
  const { getAnswerByQuestionId } = useGameResults();

  useEffect(() => {
    const timer = setTimeout(() => {
      nextQuestion();
      navigate("/contador");
    }, 3000);

    // Cleanup timeout if component unmounts
    return () => clearTimeout(timer);
  }, [navigate]);

  if (!currentQuestion) return null;

  const userAnswer = getAnswerByQuestionId(currentQuestion.id);

  if (!userAnswer) return null;

  const hasAnswered = userAnswer.selectedAnswer !== null;
  const isCorrect = hasAnswered && userAnswer.isCorrect;

  const formatTime = (timeMs: number) => {
    return `${(timeMs / 1000).toFixed(3)}s`;
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="w-full min-w-[380px]">
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
            <div className="flex flex-col items-center space-y-4 mb-8">
              {user && (
                <>
                  <img
                    src={getAvatarFromPath(user?.avatar || "")}
                    alt={user.username || ""}
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
                      {user.username}
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

            {hasAnswered && userAnswer ? (
              <div className="flex justify-between items-end">
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
    </>
  );
}
