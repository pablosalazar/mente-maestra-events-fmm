import { useSettings } from "@/features/settings/context/SettingsContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

function CountDown() {
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [count, setCount] = useState(settings.countdown);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (count === 0) {
      navigate("/pregunta");
    }
  }, [count, navigate]);

  return (
    <div className="mt-[-200px] flex flex-col items-center">
      <h2 className="display-panel py-5 px-10 ">¡Preparado!</h2>

      <div className="mb-8">
        <div className="bg-[var(--secondary)] w-40 h-40 rounded-full border-6 flex items-center justify-center shadow-lg">
          <span className="text-8xl font-extrabold italic">{count}</span>
        </div>
      </div>
    </div>
  );
}

export default CountDown;
