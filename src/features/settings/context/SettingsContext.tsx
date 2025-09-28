/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext } from "react";
import type { GameSettings } from "@/types";
import { Loader } from "@/components/loader/Loader";
import { useGameSettings } from "../hooks/settings-hooks";

interface SettingsContextType {
  settings: GameSettings;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data: settings, isLoading, error, refetch } = useGameSettings();

  if (error) {
    return (
      <div className="error-container">
        <p>Error loading settings: {error.message}</p>
        <button onClick={() => refetch()}>Retry</button>
      </div>
    );
  }

  if (isLoading || !settings) {
    return <Loader whiteBackground={true} />;
  }

  const contextValue: SettingsContextType = {
    settings,
    isLoading,
    error: error || null,
    refetch,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

// Export the context
export { SettingsContext };

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
