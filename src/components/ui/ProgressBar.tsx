import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";

interface ProgressBarProps {
  onTimeUp?: () => void;
}

export function ProgressBar({ onTimeUp }: ProgressBarProps) {
  const { settings } = useSettings();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [progress, setProgress] = useState(0);

  const totalTime = settings.timeLimit;

  useEffect(() => {
    if (timeElapsed >= totalTime) {
      onTimeUp?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeElapsed((prev) => {
        const newTime = prev + 1;
        const newProgress = (newTime / totalTime) * 100;
        setProgress(Math.min(100, newProgress));

        if (newTime >= totalTime) {
          onTimeUp?.();
        }

        return Math.min(totalTime, newTime);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeElapsed, onTimeUp, totalTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const timeRemaining = totalTime - timeElapsed;

  return (
    <div className="w-[500px] mx-auto">
      {/* Contador de tiempo */}
      <div className="flex justify-end ">
        <span className="text-lg font-bold text-gray-900">
          {formatTime(timeRemaining)}
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-[var(--dark-blue)] rounded-lg h-6 overflow-hidden">
        <div
          className="h-full transition-all duration-1000 ease-linear bg-[var(--fuchsia)]"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
