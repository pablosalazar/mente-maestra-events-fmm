import { useQuestions } from "@/hooks/useQuestions";
import { useTvGame } from "@/hooks/useGame";
import { useAnswers } from "@/hooks/useAnswers";
import { useNavigate } from "react-router";
import { useEffect } from "react";

import questionIcon from "@/assets/images/tv/question-icon.png";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useTvSession } from "@/hooks/useTvSession";

export default function TvQuestionView() {
  const navigate = useNavigate();
  const { currentRoom } = useTvGame();
  const { session, updateSessionAsync } = useTvSession({
    roomId: currentRoom?.id || null,
  });
  const {
    currentQuestion,
    currentQuestionIndex,
    selectedQuestions,
    isLoadingQuestions,
    error,
  } = useQuestions(currentRoom?.id || "");

  const { answeredCount } = useAnswers({
    roomId: currentRoom?.id || "",
    sessionId: session?.id || "",
    questionId: currentQuestion?.id || "",
  });

  const navigateToFeedback = async () => {
    try {
      await updateSessionAsync({
        status: "feedback",
      });
      navigate("/tv/feedback");
    } catch (error) {
      console.error("Error updating session to feedback:", error);
    }
  };

  const handleTimeUp = async () => {
    await navigateToFeedback();
  };

  // Check if all players have answered
  useEffect(() => {
    if (session?.maxPlayers && answeredCount === session.maxPlayers && answeredCount > 0) {
      navigateToFeedback();
    }
  }, [answeredCount, session?.maxPlayers]);

  if (isLoadingQuestions) {
    return (
      <div className="glass-card ">
        <p className="text-2xl font-bold text-[var(--dark-blue)] ">
          Cargando pregunta...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tv-question-view">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="w-fit max-w-[80%]">
      {currentQuestion ? (
        <>
          <div
            className={`
              bg-[var(--secondary)] py-2 px-10 rounded-full w-fit border-3 font-bold
              absolute top-[80px] right-[20px]
            `}
          >
            <p className="text-sm font-extrabold italic">Repuestas</p>
            <p>
              {answeredCount}
              {session?.maxPlayers && (
                <span> de {session.maxPlayers}</span>
              )}{" "}
              participantes
            </p>
          </div>
          <div className="text-center text-2xl font-bold mb-3 text-gray-700">
            ({currentQuestionIndex + 1}/{selectedQuestions.length})
          </div>

          <div className="bg-[var(--secondary)] py-6 px-10 rounded-[20px] border-3 relative">
            <p className="bg-[var(--fuchsia)] text-white py-1 px-3 rounded-[10px] font-bold absolute top-[-20px] right-[10px] ">
              {currentQuestion.topic}
            </p>
            <img
              src={questionIcon}
              alt="question icon"
              width={150}
              className="absolute top-[-60px] left-[-100px]"
            />
            <h2 className="text-xl font-bold text-center">
              {currentQuestion.question}
            </h2>
          </div>

          <ProgressBar onTimeUp={handleTimeUp} />
        </>
      ) : (
        <p>Pregunta no disponible</p>
      )}
    </div>
  );
}
