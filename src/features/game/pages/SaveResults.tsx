import { useGameResults } from "@/contexts/GameResultsContext";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "@/contexts/SessionContext";
import { useNavigate } from "react-router";
import { useEffect, useMemo } from "react";
import { useSaveGameResult } from "../hooks/game-hooks";
import type { GameResultCreate } from "../types";
import { Loader } from "@/components/loader/Loader";

export default function SaveResults() {
  const navigate = useNavigate();
  const { totalScore, correctAnswers, answers } = useGameResults();
  const { settings } = useSettings();
  const { isSessionActive } = useSession();
  const { user } = useAuth();
  const saveGameResult = useSaveGameResult();

  const totalTime = useMemo(
    () => answers.reduce((sum, answer) => sum + answer.responseTimeMs, 0),
    [answers]
  );

  useEffect(() => {
    // Redirect to home if session is not active
    if (!isSessionActive) {
      console.log("Redirecting: session not active");
      navigate("/");
      return;
    }

    // Redirect to home if no data to save
    if (!user || !settings.activityCode || answers.length === 0) {
      console.log("Redirecting: missing data");
      navigate("/");
      return;
    }

    // Save game result
    const gameResult: GameResultCreate = {
      userId: user.id,
      activityCode: settings.activityCode,
      answers: answers,
      totalScore: totalScore,
      correctAnswers: correctAnswers,
      totalQuestions: settings.questions,
      totalTimeMs: totalTime,
    };

    saveGameResult.mutate(gameResult, {
      onSuccess: () => {
        navigate("/podio");
      },
      onError: (error) => {
        console.error("Error saving game result:", error);
        navigate("/");
      },
    });
  }, []);

  return (
    <>{saveGameResult.isPending && <Loader message="Guardando Resultados" />}</>
  );
}
