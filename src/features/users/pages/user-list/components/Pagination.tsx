import { type PaginationState, type PaginationHandlers } from "../types";

interface PaginationProps {
  paginationState: PaginationState;
  paginationHandlers: PaginationHandlers;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
}

export function Pagination({
  paginationState,
  paginationHandlers,
  totalItems,
  totalPages,
  startIndex,
  endIndex,
}: PaginationProps) {
  const { currentPage, itemsPerPage } = paginationState;
  const { goToPage, goToPreviousPage, goToNextPage, handleItemsPerPageChange } =
    paginationHandlers;

  if (totalItems === 0) return null;

  return (
    <div className="mt-6 space-y-4">
      {/* Items per page selector */}
      <div className="flex items-center gap-4">
        <label
          htmlFor="itemsPerPage"
          className="text-sm font-medium text-gray-700"
        >
          Elementos por página:
        </label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between">
        {/* Page info */}
        <div className="text-sm text-gray-600">
          Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de{" "}
          {totalItems} registros
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Primera
          </button>

          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => goToPage(pageNumber)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    currentPage === pageNumber
                      ? "bg-blue-500 text-white border-blue-500"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>

          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Última
          </button>
        </div>
      </div>
    </div>
  );
}
