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
    onError: (error) => {
      console.error("Error creating activity:", error);
    },
  });
};

// // Custom hook for form integration with react-hook-form
// export const useCreateActivityForm = () => {
//   const createActivity = useCreateActivity();

//   const handleSubmit = async (data: ActivityCreate) => {
//     try {
//       const result = await createActivity.mutateAsync(data);
//       return result;
//     } catch (error) {
//       throw error; // Re-throw to let the form handle the error
//     }
//   };

//   return {
//     createActivity: handleSubmit,
//     isLoading: createActivity.isPending,
//     error: createActivity.error,
//     isSuccess: createActivity.isSuccess,
//     reset: createActivity.reset,
//   };
// };
