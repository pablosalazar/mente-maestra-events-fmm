import { Loader } from "@/components/loader/Loader";
import { useUserList } from "./hooks/useUserList";
import { UserTable } from "./components/UserTable";
import { Pagination } from "./components/Pagination";
import { SearchBar } from "./components/SearchBar";

export default function UserList() {
  const {
    combinedData,
    currentData,
    isLoading,
    paginationState,
    paginationHandlers,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    searchState,
    searchHandlers,
    totalResults,
    filteredResults,
    sortState,
    sortHandlers,
  } = useUserList();

  if (isLoading) {
    return <Loader message="Cargando datos de participantes..." />;
  }

  return (
    <div className="bg-white p-6 z-50">
      <h1 className="text-2xl font-bold mb-6">Lista de Participantes</h1>

      <SearchBar
        searchState={searchState}
        searchHandlers={searchHandlers}
        totalResults={totalResults}
        filteredResults={filteredResults}
        allData={combinedData}
      />

      <UserTable 
        data={currentData} 
        totalItems={totalItems}
        sortState={sortState}
        sortHandlers={sortHandlers}
      />

      <Pagination
        paginationState={paginationState}
        paginationHandlers={paginationHandlers}
        totalItems={totalItems}
        totalPages={totalPages}
        startIndex={startIndex}
        endIndex={endIndex}
      />
    </div>
  );
}
