import { useTabletGame } from "@/hooks/useGame";
import { useAuth } from "@/hooks/useAuth";
import { useQuestions } from "@/hooks/useQuestions";
import { getAllSessionAnswers } from "@/services/answers.service";
import { findMostRecentEndedSession } from "@/services/session.service";
import { saveUserScore } from "@/services/userScore.service"; // Agregar esta importación
import { getAvatarFromPath } from "@/utils/avatars";
import { Loader } from "@/components/loader/Loader";
import { Trophy, Clock, LogOut, Crown, Medal, Award } from "lucide-react";
import { useState, useEffect } from "react";
import clsx from "clsx";
import type { ParticipantAnswer, Participant, GameSession } from "@/types";

interface UserWithScore {
  participant: Participant;
  totalScore: number;
  answeredQuestions: number;
  correctAnswers: number;
  totalTime: number;
  answers: ParticipantAnswer[];
  position: number;
}

function Podium() {
  const { user, logout } = useAuth();
  const { currentRoom } = useTabletGame();
  const { selectedQuestionIds } = useQuestions(currentRoom?.id || "");

  const [userStats, setUserStats] = useState<UserWithScore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [completedSession, setCompletedSession] = useState<GameSession | null>(
    null
  );
  const [scoreSaved, setScoreSaved] = useState(false); // Nuevo estado para tracking

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

  // Función para calcular la posición del usuario
  const calculateUserPosition = (
    userScore: number,
    allAnswers: ParticipantAnswer[]
  ): number => {
    const participantScores = new Map<string, number>();

    allAnswers.forEach((answer) => {
      const currentScore = participantScores.get(answer.participantId) || 0;
      participantScores.set(answer.participantId, currentScore + answer.score);
    });

    const sortedScores = Array.from(participantScores.values()).sort(
      (a, b) => b - a
    );

    const position = sortedScores.findIndex((score) => score <= userScore) + 1;
    return position || sortedScores.length + 1;
  };

  // Calculate user statistics
  const calculateUserStats = (
    participant: Participant,
    answers: ParticipantAnswer[]
  ): UserWithScore => {
    const userAnswers = answers.filter(
      (answer) => answer.participantId === participant.id
    );

    const totalScore = userAnswers.reduce(
      (sum, answer) => sum + answer.score,
      0
    );

    const correctAnswers = userAnswers.filter(
      (answer) => answer.isCorrect
    ).length;

    const totalTime = userAnswers.reduce(
      (sum, answer) => sum + answer.responseTimeMs,
      0
    );

    const position = calculateUserPosition(totalScore, answers);

    return {
      participant,
      totalScore,
      answeredQuestions: userAnswers.length,
      correctAnswers,
      totalTime,
      answers: userAnswers,
      position,
    };
  };

  useEffect(() => {
    const findCompletedSession = async () => {
      if (!currentRoom?.id) return;

      try {
        const completedSession = await findMostRecentEndedSession(
          currentRoom.id
        );

        if (completedSession) {
          console.log("Found completed session:", completedSession.id);
          setCompletedSession(completedSession);
        } else {
          console.log("No completed session found");
          setError("No se encontró ninguna sesión completada");
        }
      } catch (err) {
        console.error("Error finding completed session:", err);
        setError("Error al buscar sesión completada");
      }
    };

    findCompletedSession();
  }, [currentRoom?.id]);

  // Función para guardar el score del usuario
  const saveUserScoreToFirestore = async (stats: UserWithScore) => {
    if (!user?.id || !currentRoom?.id || !completedSession?.id || scoreSaved) {
      return; // No guardar si ya se guardó o faltan datos
    }

    try {
      const scoreData = {
        userId: user.id,
        userDocument: user.documentNumber || "", // Asumiendo que el usuario tiene documento
        roomId: currentRoom.id,
        sessionId: completedSession.id,
        totalScore: stats.totalScore,
        position: stats.position,
        totalTimeMs: stats.totalTime,
        correctAnswers: stats.correctAnswers,
      };

      await saveUserScore(scoreData);
      setScoreSaved(true);
    } catch (error) {
      console.error("Error guardando score:", error);
    }
  };

  // Load user statistics from completed session
  useEffect(() => {
    const loadUserStats = async () => {
      if (!currentRoom?.id || !completedSession?.id || !user?.id) {
        return;
      }

      try {
        setIsLoading(true);
        const answers = await getAllSessionAnswers(
          currentRoom.id,
          completedSession.id
        );

        const userAnswers = answers.filter((answer) => {
          return answer.participantId === user.id;
        });

        if (userAnswers.length > 0) {
          const mockParticipant: Participant = {
            id: user.id || "",
            userId: user.id || "",
            username: user.username || "",
            avatar: user.avatar || "",
            joinedAt: new Date(),
            position: 1,
          };

          const stats = calculateUserStats(mockParticipant, answers);
          setUserStats(stats);

          // Guardar el score automáticamente cuando se calculen las estadísticas
          await saveUserScoreToFirestore(stats);
        } else {
          setError(
            "No se encontraron respuestas del usuario en la sesión completada"
          );
        }
      } catch (err) {
        console.error("Error loading user stats:", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar estadísticas"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadUserStats();
  }, [currentRoom?.id, completedSession?.id, user?.id, scoreSaved]);

  const formatTime = (milliseconds: number): string => {
    return `${milliseconds.toLocaleString()}ms`;
  };

  const handleExit = () => {
    logout();
  };

  if (!userStats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="glass-card p-8 text-center">
          <p className="text-gray-600 text-xl mb-4">
            No se encontraron estadísticas del usuario
          </p>
          <button
            onClick={handleExit}
            className="btn btn-primary flex items-center gap-2"
          >
            <LogOut className="w-6 h-6" />
            Salir
          </button>
        </div>
      </div>
    );
  }

  const { participant, totalScore, correctAnswers, totalTime, position } =
    userStats;
  const totalQuestions = selectedQuestionIds.length;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      {isLoading && <Loader message="Cargando estadísticas..." />}
      {/* Mostrar indicador de que el score se guardó */}
      {scoreSaved && (
        <div className="mb-4 p-2 bg-green-100 text-green-800 rounded-lg text-sm">
          ✅ Score guardado exitosamente
        </div>
      )}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h1 className="text-4xl font-bold text-[var(--dark-blue)]">
            ¡Juego Completado!
          </h1>
        </div>
      </div>

      {/* User Stats Card con diseño del TvPodium */}
      <div
        className={clsx(
          "relative p-8 rounded-2xl border-4 shadow-2xl transition-all duration-500 transform hover:scale-105 w-full max-w-md mb-8",
          getPodiumColors(position),
          position <= 3 ? "text-white" : "text-gray-800"
        )}
      >
        {/* Position Badge */}
        <div className="absolute -top-4 -left-4 w-12 h-12 bg-white border-4 border-current rounded-full flex items-center justify-center shadow-xl">
          <span className="font-extrabold text-2xl text-gray-800">
            {position}
          </span>
        </div>

        {/* Podium Icon */}
        <div className="absolute -top-4 -right-4 w-12 h-12 bg-white border-4 border-current rounded-full flex items-center justify-center shadow-xl">
          {getPodiumIcon(position)}
        </div>

        {/* User Info */}
        <div className="text-center mb-2">
          <img
            src={getAvatarFromPath(participant.avatar)}
            alt={participant.username}
            className="w-20 h-20 rounded-full border-4 border-white shadow-lg mx-auto mb-3"
          />
          <h2 className="text-2xl font-bold mb-1 text-gray-700">
            @{participant.username}
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
            Aciertos: {correctAnswers}/{totalQuestions}
          </div>
        </div>

        {/* Winner Crown for 1st place */}
        {position === 1 && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="text-6xl animate-bounce">👑</div>
          </div>
        )}
      </div>

      {/* Exit Button */}
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

export default Podium;
