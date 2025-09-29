import { useGameResults } from "@/contexts/GameResultsContext";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "@/contexts/SessionContext";
import { useNavigate } from "react-router";
import { getAvatarFromPath } from "@/utils/avatars";
import { formatTime } from "@/utils/time";
import clsx from "clsx";
import { Crown, Trophy, Medal, Award, Clock, LogOut } from "lucide-react";
import { useEffect, useMemo } from "react";

export default function Podium() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { totalScore, correctAnswers, answers, resetResults } =
    useGameResults();
  const { settings } = useSettings();
  const { user } = useAuth();
  const { resetSession } = useSession();

  useEffect(() => {
    setTimeout(() => {
      navigate("/");
    }, 6000);
  }, []);

  const totalTime = useMemo(
    () => answers.reduce((sum, answer) => sum + answer.responseTimeMs, 0),
    [answers]
  );

  const handleExit = () => {
    resetSession();
    resetResults();

    logout();
  };

  if (!user) {
    return null;
  }

  // Función para obtener colores según la posición
  const getPodiumColors = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-500";
      case 2:
        return "bg-gradient-to-br from-gray-300 to-gray-500 border-gray-400";
      case 3:
        return "bg-gradient-to-br from-amber-400 to-amber-600 border-amber-500";
      default:
        return "bg-gradient-to-br from-blue-400 to-blue-600 border-blue-500";
    }
  };

  // Función para obtener iconos según la posición
  const getPodiumIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <Trophy className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h1 className="text-4xl font-bold text-[var(--dark-blue)]">
            ¡Juego Completado!
          </h1>
        </div>
      </div>

      <div
        className={clsx(
          "relative p-8 rounded-2xl border-4 shadow-2xl transition-all duration-500 transform hover:scale-105 w-full max-w-md mb-8",
          getPodiumColors(correctAnswers),
          correctAnswers <= 3 ? "text-white" : "text-gray-800"
        )}
      >
        {/* Position Badge */}
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-white border-4 border-current rounded-full flex items-center justify-center shadow-xl">
          <span className="font-extrabold text-2xl text-gray-800">
            {correctAnswers}
          </span>
        </div>

        {/* Podium Icon */}
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-white border-4 border-current rounded-full flex items-center justify-center shadow-xl">
          {getPodiumIcon(correctAnswers)}
        </div>

        {/* User Info */}
        <div className="text-center mb-2">
          <img
            src={getAvatarFromPath(user.avatar || "")}
            alt={user.name}
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg mx-auto mb-3"
          />
          <h2 className="text-2xl font-bold mb-1 text-gray-700">
            @{user.name}
          </h2>
        </div>

        {/* Score */}
        <div className="text-center mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold opacity-90">
                PUNTUACIÓN TOTAL
              </span>
              <Trophy className="w-4 h-4" />
            </div>
            <p className="text-3xl font-bold">{totalScore}</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold opacity-90">
                TIEMPO EMPLEADO
              </span>
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold">{formatTime(totalTime)}</p>
          </div>
          <div className="text-end">
            Aciertos: {correctAnswers}/{settings.questions}
          </div>
        </div>

        {/* Winner Crown for 1st place */}
        {correctAnswers === settings.questions && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="text-6xl animate-bounce">👑</div>
          </div>
        )}
      </div>

      <button
        onClick={handleExit}
        className="btn btn-primary flex items-center gap-2"
      >
        <LogOut className="w-6 h-6" />
        Salir
      </button>
    </div>
  );
}
