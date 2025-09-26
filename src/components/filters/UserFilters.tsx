import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";

interface UserScoreWithUserInfo {
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
  user: {
    name?: string;
    gender?: string;
    age?: string | number;
    department?: string;
    municipality?: string;
  } | null;
}

interface UserFiltersProps {
  onFiltersChange: (filters: FilterValues) => void;
  userScores: UserScoreWithUserInfo[]; // Agregamos los datos para filtrar departamentos
}

export interface FilterValues {
  searchName: string;
  searchDocument: string;
  gender: string;
  age: string;
  department: string;
}

const genderOptions = [
  { value: "", label: "Todos los géneros" },
  { value: "Masculino", label: "Masculino" },
  { value: "Femenino", label: "Femenino" },
];

const ageOptions = [
  { value: "", label: "Todas las edades" },
  { value: "18-25", label: "18-25 años" },
  { value: "26-35", label: "26-35 años" },
  { value: "36-45", label: "36-45 años" },
  { value: "46-55", label: "46-55 años" },
  { value: "56+", label: "56+ años" },
];

function UserFilters({ onFiltersChange, userScores }: UserFiltersProps) {
  const { register, control, watch, setValue } = useForm<FilterValues>({
    defaultValues: {
      searchName: "",
      searchDocument: "",
      gender: "",
      age: "",
      department: "",
    },
  });

  const allFilters = watch();

  // Actualizar filtros cuando cambien
  useEffect(() => {
    onFiltersChange(allFilters);
  }, [allFilters, onFiltersChange]);

  // Generar opciones de departamento basadas en los datos existentes
  const departmentsOptions = useMemo(() => {
    // Obtener departamentos únicos de los registros de userScores
    const existingDepartments = new Set<string>();
    
    userScores.forEach((score) => {
      if (score.user?.department) {
        existingDepartments.add(score.user.department);
      }
    });

    // Convertir a array y ordenar alfabéticamente
    const sortedDepartments = Array.from(existingDepartments).sort();

    return [
      { value: "", label: "Todos los departamentos" },
      ...sortedDepartments.map((department) => ({
        value: department,
        label: department,
      })),
    ];
  }, [userScores]);

  const clearAllFilters = () => {
    setValue("searchName", "");
    setValue("searchDocument", "");
    setValue("gender", "");
    setValue("age", "");
    setValue("department", "");
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Filtros de búsqueda
        </h3>
        <button
          type="button"
          onClick={clearAllFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Búsqueda por nombre */}
        <div>
          <label
            htmlFor="searchName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Buscar por nombre
          </label>
          <input
            id="searchName"
            type="text"
            placeholder="Nombre del usuario..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            {...register("searchName")}
          />
        </div>

        {/* Búsqueda por documento */}
        <div>
          <label
            htmlFor="searchDocument"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Buscar por documento
          </label>
          <input
            id="searchDocument"
            type="text"
            placeholder="Número de documento..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            {...register("searchDocument")}
          />
        </div>

        {/* Filtro por género */}
        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Género
          </label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                inputId="gender"
                className="text-sm"
                classNamePrefix="react-select"
                options={genderOptions}
                value={
                  genderOptions.find(
                    (option) => option.value === field.value
                  ) || genderOptions[0]
                }
                onChange={(option) => field.onChange(option?.value || "")}
                isSearchable={false}
              />
            )}
          />
        </div>

        {/* Filtro por edad */}
        <div>
          <label
            htmlFor="age"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Rango de edad
          </label>
          <Controller
            name="age"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                inputId="age"
                className="text-sm"
                classNamePrefix="react-select"
                options={ageOptions}
                value={
                  ageOptions.find((option) => option.value === field.value) ||
                  ageOptions[0]
                }
                onChange={(option) => field.onChange(option?.value || "")}
                isSearchable={false}
              />
            )}
          />
        </div>

        {/* Filtro por departamento */}
        <div>
          <label
            htmlFor="department"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Departamento
          </label>
          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                inputId="department"
                className="text-sm"
                classNamePrefix="react-select"
                options={departmentsOptions}
                value={
                  departmentsOptions.find(
                    (option) => option.value === field.value
                  ) || departmentsOptions[0]
                }
                onChange={(option) => field.onChange(option?.value || "")}
                isSearchable
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}

export default UserFilters;
