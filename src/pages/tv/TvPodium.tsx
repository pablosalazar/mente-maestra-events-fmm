import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTvSession } from "@/hooks/useTvSession";
import { useQuestions } from "@/hooks/useQuestions";
import { getAllSessionAnswers } from "@/services/answers.service";
import { getAvatarFromPath } from "@/utils/avatars";
import { Trophy, Medal, Award, Crown, Clock } from "lucide-react";
import clsx from "clsx";
import type { ParticipantAnswer, Participant } from "@/types";
import { useTvGame } from "@/hooks/useGame";
import { Loader } from "@/components/loader/Loader";

interface ParticipantWithScore {
  participant: Participant;
  totalScore: number;
  answeredQuestions: number;
  correctAnswers: number; // Nuevo campo para aciertos
  totalTime: number;
  answers: ParticipantAnswer[];
}

const TvPodium = () => {
  const navigate = useNavigate();
  const { currentRoom } = useTvGame();
  const { session, updateSessionAsync } = useTvSession({
    roomId: currentRoom?.id || null,
  });
  const { selectedQuestionIds } = useQuestions(currentRoom?.id || "");

  const [allAnswers, setAllAnswers] = useState<ParticipantAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Load all session answers
  useEffect(() => {
    const loadAllAnswers = async () => {
      if (!currentRoom?.id || !session?.id) return;

      try {
        setIsLoading(true);
        const answers = await getAllSessionAnswers(currentRoom.id, session.id);
        setAllAnswers(answers);
      } catch (err) {
        console.error("Error loading session answers:", err);
        setError(
          err instanceof Error ? err.message : "Error al cargar respuestas"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadAllAnswers();
  }, [currentRoom?.id, session?.id]);

  // 10-second countdown and transition to end
  useEffect(() => {
    if (!session || isLoading) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleEndGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session, isLoading]);

  const handleEndGame = async () => {
    if (isTransitioning || !session) return;

    setIsTransitioning(true);

    try {
      await updateSessionAsync({
        status: "ended",
        finishedAt: new Date(),
      });

      // Redirect to waiting room or lobby
      navigate("/tv/sala-espera");
    } catch (error) {
      console.error("Error ending game:", error);
    } finally {
      setIsTransitioning(false);
    }
  };

  // Calculate accumulated scores for each participant
  const calculateParticipantScores = (): ParticipantWithScore[] => {
    if (!session?.participants || !allAnswers.length) return [];

    return session.participants.map((participant) => {
      const participantAnswers = allAnswers.filter(
        (answer) => answer.participantId === participant.userId
      );

      const totalScore = participantAnswers.reduce(
        (sum, answer) => sum + answer.score,
        0
      );

      // Calcular número de aciertos
      const correctAnswers = participantAnswers.filter(
        (answer) => answer.isCorrect
      ).length;

      // Cambiar a tiempo total acumulado (sin división)
      const totalTime = participantAnswers.reduce(
        (sum, answer) => sum + answer.responseTimeMs,
        0
      );

      return {
        participant,
        totalScore,
        answeredQuestions: participantAnswers.length,
        correctAnswers,
        totalTime,
        answers: participantAnswers,
      };
    });
  };

  const formatTime = (timeMs: number) => {
    return `${(timeMs / 1000).toFixed(3)}s`;
  };

  const getPodiumIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-500" />;
      case 2:
        return <Medal className="w-7 h-7 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Trophy className="w-5 h-5 text-gray-500" />;
    }
  };

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

  // Sort participants by total score (descending)
  const sortedParticipants = calculateParticipantScores().sort(
    (a, b) => b.totalScore - a.totalScore
  );

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="glass-card">
          <p className="text-2xl font-bold text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <Loader message="Cargando podium..." />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Countdown Timer */}
      {countdown > 0 && (
        <div className="fixed top-20 right-6 bg-[var(--dark-blue)] text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span className="font-bold">Finalizando en: {countdown}s</span>
          </div>
        </div>
      )}

      {isTransitioning && <Loader message="Finalizando juego..." />}

      {/* Title */}
      <div className="text-center mb-10">
        <h1 className="text-4xl italic font-bold text-[var(--dark-blue)] mb-2">
          🏆 PODIUM FINAL 🏆
        </h1>
      </div>

      {/* Podium Display */}
      <div className="flex justify-center gap-10">
        {sortedParticipants.map((participantData, index) => {
          const position = index + 1;
          const { participant, totalScore, correctAnswers, totalTime } =
            participantData;

          return (
            <div
              key={participant.userId}
              className={clsx(
                "relative p-6 rounded-2xl border-4 shadow-2xl transition-all duration-500 transform hover:scale-105",
                getPodiumColors(position),
                position === 1 && "md:col-span-2 lg:col-span-1 order-first",
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

              {/* Participant Info */}
              <div className="text-center mb-3">
                <img
                  src={getAvatarFromPath(participant.avatar)}
                  alt={participant.username}
                  className="w-20 h-20 rounded-full border-4 border-white shadow-lg mx-auto mb-3"
                />
                <h3 className="text-xl font-bold mb-1">
                  {participant.username}
                </h3>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                {/* Total Score */}
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold opacity-90">
                      PUNTOS TOTALES
                    </span>
                    <Trophy className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-bold">{totalScore}</p>
                </div>

                {/* Correct Answers */}
                {/* <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold opacity-90">
                      ACIERTOS
                    </span>
                    <Award className="w-4 h-4" />
                  </div>
                  <p className="text-lg font-bold">
                    {correctAnswers}/{selectedQuestionIds.length}
                  </p>
                </div> */}

                {/* Total Time */}
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
                  Aciertos {correctAnswers}/{selectedQuestionIds.length}
                </div>
              </div>

              {/* Winner Crown for 1st place */}
              {position === 1 && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <div className="text-6xl animate-bounce">👑</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Final Message */}
      <div className="text-center mt-8">
        <div className="bg-white/80 rounded-2xl py-3 px-10 shadow-lg w-fit mx-auto">
          <h2 className="text-xl font-bold text-[var(--dark-blue)] mb-0">
            ¡Felicitaciones a todos los participantes!
          </h2>
          <p className="text-lg text-gray-700">
            Gracias por jugar{" "}
            <strong className="font-bold  text-[var(--dark-blue)]">
              Mente Maestra
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TvPodium;
