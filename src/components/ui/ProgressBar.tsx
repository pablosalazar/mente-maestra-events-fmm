import { useSettings } from "@/features/settings/context/SettingsContext";
import { useState, useEffect, useRef } from "react";

interface ProgressBarProps {
  onTimeUp?: () => void;
  isPaused?: boolean;
}

export function ProgressBar({ onTimeUp, isPaused = false }: ProgressBarProps) {
  const { settings } = useSettings();
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [progress, setProgress] = useState(0);
  const hasTimeUpBeenCalled = useRef(false);

  const totalTime = settings.timeLimit;

  useEffect(() => {
    // Don't start timer if paused
    if (isPaused) {
      return;
    }

    // Reset the flag when timer starts fresh
    if (timeElapsed === 0) {
      hasTimeUpBeenCalled.current = false;
    }

    // If time is already up and callback has been called, don't start timer
    if (timeElapsed >= totalTime && hasTimeUpBeenCalled.current) {
      return;
    }

    const timer = setInterval(() => {
      setTimeElapsed((prev) => {
        const newTime = prev + 1;
        const newProgress = (newTime / totalTime) * 100;
        setProgress(Math.min(100, newProgress));

        // Call onTimeUp only once when time is up, but defer it to avoid setState during render
        if (newTime >= totalTime && !hasTimeUpBeenCalled.current) {
          hasTimeUpBeenCalled.current = true;
          // Use setTimeout to defer the callback until after the current render cycle
          setTimeout(() => {
            onTimeUp?.();
          }, 0);
        }

        return Math.min(totalTime, newTime);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeElapsed, onTimeUp, totalTime, isPaused]);

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
