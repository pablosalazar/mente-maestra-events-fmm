import { useState, useEffect, useMemo, useCallback } from "react";
import { getAllUserScores } from "@/services/userScore.service";
import { getUserById, getTotalUsersCount } from "@/services/auth.service";
import { Loader } from "@/components/loader/Loader";
import UserFilters, {
  type FilterValues,
} from "@/components/filters/UserFilters";
import type { UserWithId } from "@/types";

interface UserScore {
  id: string;
  userId: string;
  userDocument: string;
  roomId: string;
  sessionId: string;
  totalScore: number;
  position: number;
  totalTimeMs: number;
  createdAt: Date;
  correctAnswers: number;
}

interface UserScoreWithUserInfo extends UserScore {
  user: UserWithId | null;
}

// Tipo para manejar diferentes formatos de fecha de Firestore
type FirestoreDate =
  | Date
  | { toDate: () => Date }
  | { seconds: number; nanoseconds?: number }
  | string
  | number
  | null
  | undefined;

function UserList() {
  const [userScores, setUserScores] = useState<UserScoreWithUserInfo[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterValues>({
    searchName: "",
    searchDocument: "",
    gender: "",
    age: "",
    department: "",
  });

  const itemsPerPage = 50;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Obtener scores y total de usuarios en paralelo
        const [scores, usersCount] = await Promise.all([
          getAllUserScores(),
          getTotalUsersCount(),
        ]);

        setTotalUsers(usersCount);

        // Obtener información de usuario para cada score
        const scoresWithUserInfo = await Promise.all(
          scores.map(async (score) => {
            try {
              const user = await getUserById(score.userId);
              return { ...score, user };
            } catch (error) {
              console.error(`Error fetching user ${score.userId}:`, error);
              return { ...score, user: null };
            }
          })
        );

        // Ordenar por puntaje de mayor a menor
        const sortedScores = scoresWithUserInfo.sort(
          (a, b) => b.totalScore - a.totalScore
        );
        setUserScores(sortedScores);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Error al cargar los datos");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTime = (timeMs: number): string => {
    const seconds = Math.floor(timeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (date: FirestoreDate): string => {
    try {
      if (!date) {
        return "Fecha no disponible";
      }

      let dateObj: Date;

      if (date instanceof Date) {
        // Ya es un objeto Date
        dateObj = date;
      } else if (
        typeof date === "object" &&
        "toDate" in date &&
        typeof date.toDate === "function"
      ) {
        // Firestore Timestamp
        dateObj = date.toDate();
      } else if (
        typeof date === "object" &&
        "seconds" in date &&
        typeof date.seconds === "number"
      ) {
        // Firestore Timestamp object
        dateObj = new Date(date.seconds * 1000);
      } else if (typeof date === "string" || typeof date === "number") {
        // String o número
        dateObj = new Date(date);
      } else {
        // Valor inválido
        return "Fecha no disponible";
      }

      // Verificar si la fecha es válida
      if (isNaN(dateObj.getTime())) {
        return "Fecha no disponible";
      }

      return dateObj.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Fecha no disponible";
    }
  };

  // Función para filtrar usuarios (sin municipio)
  const filteredUserScores = useMemo(() => {
    return userScores.filter((score) => {
      const user = score.user;

      // Filtro por nombre
      if (filters.searchName && user?.name) {
        if (
          !user.name.toLowerCase().includes(filters.searchName.toLowerCase())
        ) {
          return false;
        }
      }

      // Filtro por documento
      if (filters.searchDocument) {
        if (!score.userDocument.includes(filters.searchDocument)) {
          return false;
        }
      }

      // Filtro por género
      if (filters.gender && user?.gender) {
        if (user.gender !== filters.gender) {
          return false;
        }
      }

      // Filtro por edad
      if (filters.age && user?.age) {
        const userAge = parseInt(user.age.toString());
        switch (filters.age) {
          case "18-25":
            if (userAge < 18 || userAge > 25) return false;
            break;
          case "26-35":
            if (userAge < 26 || userAge > 35) return false;
            break;
          case "36-45":
            if (userAge < 36 || userAge > 45) return false;
            break;
          case "46-55":
            if (userAge < 46 || userAge > 55) return false;
            break;
          case "56+":
            if (userAge < 56) return false;
            break;
        }
      }

      // Filtro por departamento
      if (filters.department && user?.department) {
        if (user.department !== filters.department) {
          return false;
        }
      }

      return true;
    });
  }, [userScores, filters]);

  // Calcular datos de paginación con datos filtrados
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredUserScores.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredUserScores.slice(startIndex, endIndex);

    return {
      totalPages,
      currentItems,
      startIndex,
      endIndex: Math.min(endIndex, filteredUserScores.length),
      totalItems: filteredUserScores.length,
    };
  }, [filteredUserScores, currentPage]);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Manejar cambios en los filtros
  const handleFiltersChange = useCallback((newFilters: FilterValues) => {
    // setFilters(newFilters);
  }, []);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, paginationData.totalPages)));
  };

  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(paginationData.totalPages);
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(1, prev - 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(paginationData.totalPages, prev + 1));

  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const { totalPages } = paginationData;
    const maxVisiblePages = 5;
    const pages: number[] = [];

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  // Función para descargar CSV
  const downloadCSV = useCallback(() => {
    // Crear encabezados del CSV
    const headers = [
      "Posición",
      "Nombre",
      "Documento",
      "Género",
      "Edad",
      "Departamento",
      "Municipio",
      "Puntaje Total",
      "Respuestas Correctas",
      "Tiempo Total (min)",
      "Fecha de Participación",
    ];

    if (isLoading) {
      return <Loader message="Cargando participantes..." />;
    }

    if (error) {
      return (
        <div className="text-center text-red-500 p-8">
          <p>{error}</p>
        </div>
      );
    }

    // Convertir datos filtrados a formato CSV
    const csvData = filteredUserScores.map((userScore, index) => {
      const user = userScore.user;
      const timeInMinutes = Math.round(userScore.totalTimeMs / 60000);
      const formattedDate = formatDate(userScore.createdAt);

      return [
        index + 1, // Posición en la lista filtrada
        user?.name || "N/A",
        user?.documentNumber || userScore.userDocument,
        user?.gender || "N/A",
        user?.age || "N/A",
        user?.department || "N/A",
        user?.municipality || "N/A",
        userScore.totalScore,
        userScore.correctAnswers,
        timeInMinutes,
        formattedDate,
      ];
    });

    // Combinar encabezados y datos
    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `participantes_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filteredUserScores]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Participantes</h1>

          <div className="flex items-start gap-6">
            {/* Botón de descarga CSV */}
            <button
              onClick={downloadCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm"
              title="Descargar datos filtrados en formato CSV"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Descargar CSV
            </button>

            {/* Estadísticas */}
            <div className="space-y-2 text-end">
              <div className="text-sm text-gray-600">
                <span className="font-semibold">
                  Total usuarios registrados:
                </span>{" "}
                {totalUsers}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold">Total participantes:</span>{" "}
                {userScores.length}
              </div>
              <div className="text-sm text-gray-500">
                <span className="font-semibold">Usuarios sin participar:</span>{" "}
                {totalUsers - userScores.length}
              </div>
              <div className="text-sm text-blue-600">
                <span className="font-semibold">Resultados filtrados:</span>{" "}
                {filteredUserScores.length}
              </div>
            </div>
          </div>
        </div>

        {/* Componente de filtros con datos de userScores */}
        <UserFilters
          onFiltersChange={handleFiltersChange}
          userScores={userScores}
        />

        {/* Información de paginación */}
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Mostrando {paginationData.startIndex + 1} -{" "}
            {paginationData.endIndex} de {paginationData.totalItems}{" "}
            participantes
            {paginationData.totalItems !== userScores.length && (
              <span className="text-blue-600 ml-1">
                (filtrados de {userScores.length} total)
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            Página {currentPage} de {paginationData.totalPages}
          </div>
        </div>

        {/* Mensaje cuando no hay resultados */}
        {filteredUserScores.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">
              No se encontraron participantes con los filtros aplicados.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Intenta ajustar los criterios de búsqueda.
            </p>
          </div>
        )}

        {/* Tabla */}
        {filteredUserScores.length > 0 && (
          <>
            <div className="overflow-auto max-h-96 border border-gray-200 rounded-lg shadow-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avatar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Género
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Municipio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Puntaje Total ↓
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posición
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Respuestas Correctas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiempo Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginationData.currentItems.map((score, index) => (
                    <tr key={score.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {paginationData.startIndex + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {score.user?.avatar ? (
                          <img
                            src={score.user.avatar}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/default-avatar.png";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 text-xs">N/A</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {score.user?.name || "Usuario no encontrado"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {score.user?.gender || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {score.user?.age || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {score.user?.department || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {score.user?.municipality || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {score.userDocument}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {score.totalScore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {score.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {score.correctAnswers}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTime(score.totalTimeMs)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(score.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Controles de paginación - solo mostrar si hay más de una página */}
            {paginationData.totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Navegación principal */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Primera
                  </button>
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  {/* Números de página */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          pageNum === currentPage
                            ? "bg-blue-600 text-white"
                            : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === paginationData.totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                  <button
                    onClick={goToLastPage}
                    disabled={currentPage === paginationData.totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Última
                  </button>
                </div>

                {/* Información adicional en móvil */}
                <div className="text-sm text-gray-600 sm:hidden">
                  {currentPage} / {paginationData.totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UserList;
