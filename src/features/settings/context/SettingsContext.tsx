import { createContext, useEffect, useState } from "react";

import type { GameSettings } from "@/types";
import { Loader } from "@/components/loader/Loader";
import { SettingsService } from "../services/settings.service";

interface SettingsContextType {
  settings: GameSettings;
  isLoading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const newSettings = await SettingsService.get();
      setSettings(newSettings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading settings");
      console.error("Error loading settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  if (error) {
    return (
      <div className="error-container">
        <p>Error loading settings: {error}</p>
        <button onClick={refreshSettings}>Retry</button>
      </div>
    );
  }
  if (!settings) return <Loader whiteBackground={true} />;

  const contextValue: SettingsContextType = {
    settings,
    isLoading,
    error,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

// Export the context
export { SettingsContext };
