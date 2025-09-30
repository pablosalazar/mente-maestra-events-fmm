import { getAvatarFromPath } from "@/utils/avatars";
import { formatTime } from "@/utils/time";
import {
  type UserWithGameResult,
  type SortState,
  type SortHandlers,
  type SortField,
} from "../types";

interface UserTableProps {
  data: UserWithGameResult[];
  totalItems: number;
  sortState: SortState;
  sortHandlers: SortHandlers;
}

interface SortableHeaderProps {
  field: SortField;
  children: React.ReactNode;
  sortState: SortState;
  onSort: (field: SortField) => void;
}

function SortableHeader({
  field,
  children,
  sortState,
  onSort,
}: SortableHeaderProps) {
  const isActive = sortState.field === field;
  const direction = sortState.direction;

  return (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <div className="flex flex-col">
          <svg
            className={`w-3 h-3 ${
              isActive && direction === "asc"
                ? "text-blue-600"
                : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            className={`w-3 h-3 -mt-1 ${
              isActive && direction === "desc"
                ? "text-blue-600"
                : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </th>
  );
}

function TruncatedText({
  text,
  maxLength = 20,
}: {
  text: string;
  maxLength?: number;
}) {
  const shouldTruncate = text.length > maxLength;
  const displayText = shouldTruncate
    ? `${text.substring(0, maxLength)}...`
    : text;

  if (shouldTruncate) {
    return (
      <div className="text-sm text-gray-900 relative group">
        <span>{displayText}</span>
        <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
          {text}
        </div>
      </div>
    );
  }

  return <div className="text-sm text-gray-900">{displayText}</div>;
}

export function UserTable({
  data,
  totalItems,
  sortState,
  sortHandlers,
}: UserTableProps) {
  return (
    <div className="overflow-x-auto max-h-[calc(100vh-400px)]">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Avatar
            </th>
            <SortableHeader
              field="name"
              sortState={sortState}
              onSort={sortHandlers.handleSort}
            >
              Nombre
            </SortableHeader>

            <SortableHeader
              field="activityName"
              sortState={sortState}
              onSort={sortHandlers.handleSort}
            >
              Evento
            </SortableHeader>
            <SortableHeader
              field="activityCode"
              sortState={sortState}
              onSort={sortHandlers.handleSort}
            >
              Código Actividad
            </SortableHeader>
            <SortableHeader
              field="correctAnswers"
              sortState={sortState}
              onSort={sortHandlers.handleSort}
            >
              Respuestas Correctas
            </SortableHeader>
            <SortableHeader
              field="totalScore"
              sortState={sortState}
              onSort={sortHandlers.handleSort}
            >
              Puntaje Total
            </SortableHeader>
            <SortableHeader
              field="totalTimeMs"
              sortState={sortState}
              onSort={sortHandlers.handleSort}
            >
              Tiempo Total
            </SortableHeader>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                {totalItems === 0
                  ? "No hay datos disponibles"
                  : "No hay datos en esta página"}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex-shrink-0 h-10 w-10">
                    {item.avatar ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover"
                        src={getAvatarFromPath(item.avatar)}
                        alt={`Avatar de ${item.name}`}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {item.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {item.name}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <TruncatedText
                    text={item.activityName || "Evento no encontrado"}
                    maxLength={20}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {item.activityCode || "-"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {item.correctAnswers}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {item.totalScore}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatTime(item.totalTimeMs)}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
