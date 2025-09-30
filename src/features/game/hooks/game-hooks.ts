import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GameService } from "../services/game.service";
import type { GameResultCreate } from "../types";

// Query Keys
export const gameKeys = {
  all: ["gameResults"] as const,
  userResults: (userId: string) => ["gameResults", "user", userId] as const,
  topResults: (activityCode: string, limit?: number) =>
    ["gameResults", "top", activityCode, limit] as const,
  activityResults: (activityCode: string) =>
    ["gameResults", "activity", activityCode] as const,
  allResults: ["gameResults", "all"] as const,
};

// Query Hooks
export const useUserResults = (userId: string) => {
  return useQuery({
    queryKey: gameKeys.userResults(userId),
    queryFn: () => GameService.getUserResults(userId),
    enabled: !!userId,
  });
};

export const useTopResults = (activityCode: string, limit: number = 10) => {
  return useQuery({
    queryKey: gameKeys.topResults(activityCode, limit),
    queryFn: () => GameService.getTopResults(activityCode, limit),
    enabled: !!activityCode,
  });
};

export const useActivityResults = (activityCode: string) => {
  return useQuery({
    queryKey: gameKeys.activityResults(activityCode),
    queryFn: () => GameService.getActivityResults(activityCode),
    enabled: !!activityCode,
  });
};

export const useAllResults = () => {
  return useQuery({
    queryKey: gameKeys.allResults,
    queryFn: () => GameService.getAllResults(),
  });
};

// Mutation Hooks
export const useSaveGameResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameResult: GameResultCreate) =>
      GameService.saveGameResult(gameResult),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: gameKeys.userResults(variables.userId),
      });

      queryClient.invalidateQueries({
        queryKey: gameKeys.allResults,
      });

      if (variables.activityCode) {
        queryClient.invalidateQueries({
          queryKey: gameKeys.topResults(variables.activityCode),
        });
        queryClient.invalidateQueries({
          queryKey: gameKeys.activityResults(variables.activityCode),
        });
      }
    },
    onError: (error) => {
      console.error("Error saving game result:", error);
    },
  });
};
