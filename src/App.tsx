import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { GameProvider } from "@/contexts/GameContext";
import { NetworkProvider } from "@/contexts/NetworkContext";
import { NetworkStatusIndicator } from "@/components/ui/NetworkStatusIndicator";
import { RouterProvider } from "react-router";
import router from "./routes";
import { SettingsProvider } from "./contexts/SettingsContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount) => {
        if (!navigator.onLine) return false;
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppContent() {
  return (
    <>
      <NetworkStatusIndicator />
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NetworkProvider>
        <AuthProvider>
          <SettingsProvider>
            <GameProvider>
              <AppContent />
            </GameProvider>
          </SettingsProvider>
        </AuthProvider>
      </NetworkProvider>
    </QueryClientProvider>
  );
}

export default App;
