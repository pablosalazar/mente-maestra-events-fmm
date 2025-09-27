import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserService } from "./service";
import type { User, UserCreate } from "./types";

// Query Keys
export const userKeys = {
  all: ["users"] as const,
  byId: (id: string) => ["users", "by-id", id] as const,
  byDocumentNumber: (documentNumber: string) =>
    ["users", "by-document", documentNumber] as const,
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

export const useUserByDocumentNumber = (documentNumber: string) => {
  return useQuery({
    queryKey: userKeys.byDocumentNumber(documentNumber),
    queryFn: () => UserService.getByDocumentNumber(documentNumber),
    enabled: !!documentNumber, // Only run query if documentNumber is provided
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
      queryClient.setQueryData(
        userKeys.byDocumentNumber(newUser.documentNumber),
        newUser
      );
    },
    onError: (error) => {
      console.error("Error registering user:", error);
    },
  });
};

export const useCheckUserExists = () => {
  return useMutation({
    mutationFn: (documentNumber: string) =>
      UserService.getByDocumentNumber(documentNumber),
  });
};
