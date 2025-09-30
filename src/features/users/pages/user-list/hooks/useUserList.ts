/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { useUsers } from "../../../hooks";
import { useAllResults } from "@/features/game/hooks/game-hooks";
import { useActivities } from "@/features/activities/hooks/activity-hooks";
import {
  type UserWithGameResult,
  type PaginationState,
  type PaginationHandlers,
  type SearchState,
  type SearchHandlers,
  type SortState,
  type SortHandlers,
  type SortField,
} from "../types";

export function useUserList() {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: gameResults, isLoading: resultsLoading } = useAllResults();
  const { data: activities, isLoading: activitiesLoading } = useActivities();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [activityCodeFilter, setActivityCodeFilter] = useState("");

  // Sort state
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const combinedData = useMemo((): UserWithGameResult[] => {
    if (!users || !gameResults || !activities) return [];

    const userMap = new Map(users.map((user) => [user.id, user]));
    const activityMap = new Map(
      activities.map((activity) => [activity.id, activity.name])
    );

    return gameResults.map((result) => {
      const user = userMap.get(result.userId);
      const activityName = result.activityCode
        ? activityMap.get(result.activityCode)
        : null;

      return {
        id: result.id || "",
        name: user?.name || "Usuario no encontrado",
        username: user?.username || "",
        avatar: user?.avatar,
        documentNumber: result.userDocumentNumber,
        activityCode: result.activityCode,
        activityName: activityName || "Actividad no encontrada",
        correctAnswers: result.correctAnswers,
        totalScore: result.totalScore,
        totalTimeMs: result.totalTimeMs,
      };
    });
  }, [users, gameResults, activities]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    let filtered = combinedData;

    // Filter by search term (name and document number)
    if (searchTerm.trim()) {
      const searchTermLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTermLower) ||
          item.documentNumber.toLowerCase().includes(searchTermLower)
      );
    }

    // Filter by activity code
    if (activityCodeFilter) {
      filtered = filtered.filter(
        (item) => item.activityCode === activityCodeFilter
      );
    }

    return filtered;
  }, [combinedData, searchTerm, activityCodeFilter]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === "asc" ? 1 : -1;
      if (bValue == null) return sortDirection === "asc" ? -1 : 1;

      // Convert to string for string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      let comparison = 0;
      if (aValue < bValue) {
        comparison = -1;
      } else if (aValue > bValue) {
        comparison = 1;
      }

      return sortDirection === "desc" ? -comparison : comparison;
    });
  }, [filteredData, sortField, sortDirection]);

  // Pagination calculations (based on sorted data)
  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleActivityCodeFilterChange = (code: string) => {
    setActivityCodeFilter(code);
    setCurrentPage(1);
  };

  // Sort handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field with ascending direction
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Search handlers
  const clearSearch = () => {
    setSearchTerm("");
    setActivityCodeFilter("");
    setCurrentPage(1);
  };

  const paginationState: PaginationState = {
    currentPage,
    itemsPerPage,
  };

  const paginationHandlers: PaginationHandlers = {
    goToPage,
    goToPreviousPage,
    goToNextPage,
    handleItemsPerPageChange,
  };

  const searchState: SearchState = {
    searchTerm,
    activityCodeFilter,
  };

  const searchHandlers: SearchHandlers = {
    setSearchTerm: handleSearchTermChange,
    setActivityCodeFilter: handleActivityCodeFilterChange,
    clearSearch,
  };

  const sortState: SortState = {
    field: sortField,
    direction: sortDirection,
  };

  const sortHandlers: SortHandlers = {
    handleSort,
  };

  return {
    // Data
    combinedData,
    filteredData,
    currentData,

    // Loading states
    isLoading: usersLoading || resultsLoading || activitiesLoading,

    // Pagination
    paginationState,
    paginationHandlers,
    totalItems,
    totalPages,
    startIndex,
    endIndex,

    // Search
    searchState,
    searchHandlers,
    totalResults: combinedData.length,
    filteredResults: filteredData.length,

    // Sort
    sortState,
    sortHandlers,
  };
}
