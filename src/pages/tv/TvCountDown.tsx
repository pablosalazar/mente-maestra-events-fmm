import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTvGame } from "@/hooks/useGame";
import { useTvSession } from "@/hooks/useTvSession";

function TvCountDown() {
  const [count, setCount] = useState(5);
  const navigate = useNavigate();
  const { currentRoom } = useTvGame();
  const { updateSessionAsync } = useTvSession({
    roomId: currentRoom?.id || null,
  });

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      // Cuando el contador llega a 0, actualizar sesión y redirigir
      const handleCountdownEnd = async () => {
        try {
          await updateSessionAsync({
            status: "question",
          });
          navigate("/tv/pregunta");
        } catch (error) {
          console.error("Error updating session on countdown end:", error);
        }
      };

      handleCountdownEnd();
    }
  }, [count, updateSessionAsync, navigate]);

  return (
    <div className="mt-[-200px] flex flex-col items-center">
      <h2 className="display-panel py-5 px-10 ">¡Preparados!</h2>

      <div className="mb-8">
        <div className="bg-[var(--secondary)] w-40 h-40 rounded-full border-6 flex items-center justify-center shadow-lg">
          <span className="text-8xl font-extrabold italic">{count}</span>
        </div>
      </div>
    </div>
  );
}

export default TvCountDown;
