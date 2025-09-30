import { useMemo, useState } from "react";
import { useUsers } from "../../../hooks";
import { useAllResults } from "@/features/game/hooks/game-hooks";
import {
  type UserWithGameResult,
  type PaginationState,
  type PaginationHandlers,
  type SearchState,
  type SearchHandlers,
} from "../types";

export function useUserList() {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: gameResults, isLoading: resultsLoading } = useAllResults();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [activityCodeFilter, setActivityCodeFilter] = useState("");

  const combinedData = useMemo((): UserWithGameResult[] => {
    if (!users || !gameResults) return [];

    const userMap = new Map(users.map((user) => [user.id, user]));

    return gameResults.map((result) => {
      const user = userMap.get(result.userId);
      return {
        id: result.id || "",
        name: user?.name || "Usuario no encontrado",
        username: user?.username || "",
        avatar: user?.avatar,
        documentNumber: result.userDocumentNumber,
        activityCode: result.activityCode,
        correctAnswers: result.correctAnswers,
        totalScore: result.totalScore,
        totalTimeMs: result.totalTimeMs,
      };
    });
  }, [users, gameResults]);

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

  // Pagination calculations (based on filtered data)
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearchTermChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleActivityCodeFilterChange = (code: string) => {
    setActivityCodeFilter(code);
    setCurrentPage(1);
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

  return {
    // Data
    combinedData,
    filteredData,
    currentData,

    // Loading states
    isLoading: usersLoading || resultsLoading,

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
  };
}
