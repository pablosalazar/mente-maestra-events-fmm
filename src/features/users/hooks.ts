import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserService } from "./service";
import type { User, UserCreate, UserUpdate } from "./types";

// Query Keys
export const userKeys = {
  all: ["users"] as const,
  byId: (id: string) => ["users", "by-id", id] as const,
};

// Query Hooks
export const useUsers = () => {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: UserService.getAll,
  });
};

export const useUserById = (id: string) => {
  return useQuery({
    queryKey: userKeys.byId(id),
    queryFn: () => UserService.getById(id),
    enabled: !!id, // Only run query if id is provided
  });
};

// Mutation Hooks
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: UserCreate) => UserService.create(userData),
    onSuccess: (newUser: User) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      // Add the new user to the cache
      queryClient.setQueryData(userKeys.byId(newUser.id), newUser);
    },
    onError: (error) => {
      console.error("Error registering user:", error);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: UserUpdate }) =>
      UserService.update(id, userData),
    onSuccess: (updatedUser: User) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });

      // Update the user in the cache
      queryClient.setQueryData(userKeys.byId(updatedUser.id), updatedUser);
    },
    onError: (error) => {
      console.error("Error updating user:", error);
    },
  });
};
