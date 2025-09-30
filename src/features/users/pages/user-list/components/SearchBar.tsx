import {
  type SearchState,
  type SearchHandlers,
  type UserWithGameResult,
} from "../types";

interface SearchBarProps {
  searchState: SearchState;
  searchHandlers: SearchHandlers;
  totalResults: number;
  filteredResults: number;
  allData: UserWithGameResult[];
}

export function SearchBar({
  searchState,
  searchHandlers,
  totalResults,
  filteredResults,
  allData,
}: SearchBarProps) {
  const { searchTerm, activityCodeFilter } = searchState;
  const { setSearchTerm, setActivityCodeFilter, clearSearch } = searchHandlers;

  // Get unique activity codes for the dropdown
  const uniqueActivityCodes = Array.from(
    new Set(
      allData
        .map((item) => item.activityCode)
        .filter((code) => code !== null && code !== "")
    )
  ).sort();

  const hasActiveFilters = searchTerm.length > 0 || activityCodeFilter !== "";

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input for name and document number */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg
                  className="h-5 w-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Activity code filter dropdown */}
        <div className="sm:w-64">
          <select
            value={activityCodeFilter}
            onChange={(e) => setActivityCodeFilter(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">códigos de actividad</option>
            {uniqueActivityCodes.map((code) => (
              <option key={code} value={code!}>
                {code}
              </option>
            ))}
          </select>
        </div>

        {/* Clear all filters button */}
        {hasActiveFilters && (
          <button
            onClick={clearSearch}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Search results info */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-md">
          <span>
            {filteredResults === 0 ? (
              "No se encontraron resultados"
            ) : (
              <>
                Mostrando {filteredResults} de {totalResults} participantes
                {(searchTerm || activityCodeFilter) && (
                  <span className="ml-1">
                    (filtros activos:
                    {searchTerm && " búsqueda de texto"}
                    {searchTerm && activityCodeFilter && ","}
                    {activityCodeFilter && ` código "${activityCodeFilter}"`})
                  </span>
                )}
              </>
            )}
          </span>
          <button
            onClick={clearSearch}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
