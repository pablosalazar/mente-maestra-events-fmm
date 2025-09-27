import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SettingsService } from "../services/settings.service";

// Query Keys
export const settingsKeys = {
  all: ["settings"] as const,
  gameSettings: () => ["settings", "game"] as const,
};

// Query Hooks
export const useGameSettings = () => {
  return useQuery({
    queryKey: settingsKeys.gameSettings(),
    queryFn: SettingsService.get,
  });
};

// Mutation Hooks
export const useSetActivityCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityCode: string | null) =>
      SettingsService.setCode(activityCode),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: settingsKeys.gameSettings(),
      });
    },
  });
};
