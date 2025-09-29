import { useSession } from "@/contexts/SessionContext";
import { useEffect, useRef, useState } from "react";
import questionIcon from "@/assets/images/tv/question-icon.png";
import clsx from "clsx";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useSettings } from "@/features/settings/context/SettingsContext";
import { useGameResults } from "@/contexts/GameResultsContext";
import { useNavigate } from "react-router";

export default function QuestionView() {
  const navigate = useNavigate();
  const {
    settings: { questions },
  } = useSettings();
  const { addAnswer } = useGameResults();

  const {
    currentQuestion,
    currentQuestionIndex,
    isSessionActive,
    startSession,
  } = useSession();

  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const questionStartTime = useRef<number | null>(null);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);

  useEffect(() => {
    if (!isSessionActive) {
      startSession();
    }
    questionStartTime.current = Date.now();
    setResponseTimeMs(null);
  }, [isSessionActive, startSession]);

  if (!currentQuestion) {
    return null;
  }

  const handleAnswer = async (letter: string | null) => {
    const timeMs = questionStartTime.current
      ? Date.now() - questionStartTime.current
      : 0;
    setResponseTimeMs(timeMs);
    setSelectedLetter(letter);

    const isCorrect = currentQuestion.answer === letter;
    const timeLimit = 20000; // 20 segundos en milisegundos
    const finalScore = isCorrect ? Math.max(0, timeLimit - timeMs) : 0;

    addAnswer({
      questionId: currentQuestion.id,
      selectedAnswer: letter,
      correctAnswer: currentQuestion.answer,
      isCorrect,
      responseTimeMs: timeMs,
      score: finalScore,
    });

    setTimeout(() => {
      if (currentQuestionIndex + 1 === questions) {
        navigate("/podium");
      } else {
        navigate("/feedback");
      }
    }, 3000);
  };

  const handleTimeUp = () => {
    handleAnswer(null);
  };

  return (
    <div className="w-fit max-w-[80%]">
      {currentQuestion ? (
        <>
          <div className="text-center text-2xl font-bold mb-3 text-gray-700">
            ({currentQuestionIndex + 1}/{questions})
          </div>

          <div className="bg-[var(--secondary)] py-6 px-10 rounded-[20px] border-3 relative ">
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

          <ProgressBar onTimeUp={handleTimeUp} isPaused={!!selectedLetter} />

          <section className="grid grid-cols-2 gap-10 mt-10">
            {Object.entries(currentQuestion.options).map(([key, value]) => {
              return (
                <button
                  key={key}
                  type="button"
                  className={clsx(
                    "bg-white border-2 py-6 ps-10 pe-6 max-w-[400px] rounded-[40px] flex items-center justify-center font-bold relative cursor-pointer disabled:bg-gray-100 disabled:text-gray-700",
                    selectedLetter &&
                      (currentQuestion.answer === key
                        ? "!bg-green-300"
                        : selectedLetter === key && "!bg-red-300")
                  )}
                  onClick={() => handleAnswer(key)}
                  disabled={!!selectedLetter}
                >
                  <p className="text-5xl lowercase bg-[var(--secondary)] w-16 h-16 rounded-full absolute top-[-10px] left-[-30px] flex items-center justify-center">
                    {key}
                  </p>
                  <p>{value}</p>
                </button>
              );
            })}
          </section>

          <div className="text-center text-sm mt-5">
            {responseTimeMs && (
              <p className="text-gray-600 font-bold">
                Tiempo de respuesta: {responseTimeMs}ms
              </p>
            )}
          </div>
        </>
      ) : (
        <p>Pregunta no disponible</p>
      )}
    </div>
  );
}
