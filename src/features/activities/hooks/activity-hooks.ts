import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ActivityService } from "../services/activity.service";

// Query Keys
export const activityKeys = {
  all: ["activities"] as const,
  byCode: (code: string) => ["activities", "by-code", code] as const,
};

// Query Hooks
export const useActivities = () => {
  return useQuery({
    queryKey: activityKeys.all,
    queryFn: ActivityService.getAll,
  });
};

export const useActivityByCode = (code: string) => {
  return useQuery({
    queryKey: activityKeys.byCode(code),
    queryFn: () => ActivityService.getByCode(code),
    enabled: !!code, // Only run query if code is provided
  });
};

// Mutation Hooks
export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ActivityService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.all,
      });
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ActivityService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.all,
      });
    },
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ActivityService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: activityKeys.all,
      });
    },
  });
};
