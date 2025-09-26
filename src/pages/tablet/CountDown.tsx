import { useTabletGame } from "@/hooks/useGame";
import { useSession } from "@/hooks/useSession";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

function CountDown() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentRoom } = useTabletGame();
  const { session } = useSession({
    roomId: currentRoom?.id || null,
    user,
    autoJoin: false,
  });
  const [count, setCount] = useState(5);

  // Detectar cambio de estado de la sesión
  useEffect(() => {
    if (session && session.status === "question") {
      navigate("/pregunta");
    }
  }, [session, navigate]);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [count]);

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

export default CountDown;
