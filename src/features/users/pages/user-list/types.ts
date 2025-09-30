export interface UserWithGameResult {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  activityCode: string | null;
  activityName: string | null;
  correctAnswers: number;
  totalScore: number;
  totalTimeMs: number;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

export interface PaginationHandlers {
  goToPage: (page: number) => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  handleItemsPerPageChange: (newItemsPerPage: number) => void;
}

export interface SearchState {
  searchTerm: string;
  activityCodeFilter: string;
}

export interface SearchHandlers {
  setSearchTerm: (term: string) => void;
  setActivityCodeFilter: (code: string) => void;
  clearSearch: () => void;
}

export type SortField =
  | "name"
  | "username"
  | "activityName"
  | "activityCode"
  | "correctAnswers"
  | "totalScore"
  | "totalTimeMs";
export type SortDirection = "asc" | "desc";

export interface SortState {
  field: SortField | null;
  direction: SortDirection;
}

export interface SortHandlers {
  handleSort: (field: SortField) => void;
}
