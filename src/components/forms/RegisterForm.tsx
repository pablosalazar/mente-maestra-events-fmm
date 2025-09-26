import { useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Select from "react-select";
import { registerSchema } from "@/schemas/registerSchema";
import { registerUser } from "@/services/auth.service";
import type z from "zod";
import {
  DEPARTMENTS,
  MUNICIPALITIES_BY_DEPARTMENT,
} from "@/constants/colombianRegions";
import { Loader } from "../loader/Loader";

const genderOptions = [
  { value: "Masculino", label: "Masculino" },
  { value: "Femenino", label: "Femenino" },
];

const documentTypeOptions = [
  { value: "C.C", label: "C.C" },
  { value: "T.I", label: "T.I" },
  { value: "C.E", label: "C.E" },
];

const departmentsOptions = DEPARTMENTS.map((value) => ({
  value: value,
  label: value,
}));

function RegisterForm() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      // name: "Juan Pablo Salazar",
      // gender: "Masculino",
      // age: "37",
      // documentType: "C.C",
      // documentNumber: "1061701570",
      // repeatedDocumentNumber: "1061701570",
      // department: "Cauca",
      // municipality: "Popayán",
      // acceptTerms: true,
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      reset();
      toast.success("¡Usuario registrado exitosamente!");
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Hubo un error al registrar el usuario");
      }
    },
  });

  const selectedDepartment = watch("department");

  useEffect(() => {
    setValue("municipality", "");
  }, [selectedDepartment, setValue]);

  const municipalitiesOptions = useMemo(() => {
    if (!selectedDepartment) return [];
    return (
      MUNICIPALITIES_BY_DEPARTMENT[selectedDepartment]?.map((value) => ({
        value: value,
        label: value,
      })) || []
    );
  }, [selectedDepartment]);

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    const userData: Omit<typeof data, "repeatedDocumentNumber"> = {
      name: data.name,
      gender: data.gender,
      age: data.age,
      documentType: data.documentType,
      documentNumber: data.documentNumber,
      department: data.department,
      municipality: data.municipality,
      acceptTerms: data.acceptTerms,
    };
    registerMutation.mutate(userData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {registerMutation.isPending && (
        <Loader message="Registrando usuario..." />
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="name">Nombre completo</label>
          <input id="name" className="form-input" {...register("name")} />
          <span className="form-error">
            {errors.name && <span>{errors.name.message}</span>}
          </span>
        </div>

        <div>
          <label htmlFor="gender">Género</label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                inputId="gender"
                className="form-select"
                classNamePrefix="react-select"
                options={genderOptions}
                value={
                  genderOptions.find(
                    (option) => option.value === field.value
                  ) || null
                }
                onChange={(option) => field.onChange(option?.value || "")}
                placeholder=""
                isClearable
              />
            )}
          />
          <span className="form-error">
            {errors.gender && <span>{errors.gender.message}</span>}
          </span>
        </div>

        <div>
          <label htmlFor="age">Edad</label>
          <input id="age" className="form-input" {...register("age")} />
          <span className="form-error">
            {errors.age && <span>{errors.age.message}</span>}
          </span>
        </div>

        <div>
          <label htmlFor="documentType">Tipo de Doc</label>
          <Controller
            name="documentType"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                inputId="documentType"
                className="form-select"
                classNamePrefix="react-select"
                options={documentTypeOptions}
                value={
                  documentTypeOptions.find(
                    (option) => option.value === field.value
                  ) || null
                }
                onChange={(option) => field.onChange(option?.value || "")}
                placeholder=""
              />
            )}
          />
          <span className="form-error">
            {errors.documentType && <span>{errors.documentType.message}</span>}
          </span>
        </div>

        <div>
          <label htmlFor="documentNumber">Número de Documento</label>
          <input
            id="documentNumber"
            className="form-input"
            {...register("documentNumber")}
          />
          <span className="form-error">
            {errors.documentNumber && (
              <span>{errors.documentNumber.message}</span>
            )}
          </span>
        </div>

        <div>
          <label htmlFor="repeatedDocumentNumber">
            Repita el Número de Doc.
          </label>
          <input
            id="repeatedDocumentNumber"
            className="form-input"
            {...register("repeatedDocumentNumber")}
          />
          <span className="form-error">
            {errors.repeatedDocumentNumber && (
              <span>{errors.repeatedDocumentNumber.message}</span>
            )}
          </span>
        </div>

        <div>
          <label htmlFor="department">Departamento</label>
          <Controller
            name="department"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                inputId="department"
                className="form-select"
                classNamePrefix="react-select"
                options={departmentsOptions}
                value={
                  departmentsOptions.find(
                    (option) => option.value === field.value
                  ) || null
                }
                onChange={(option) => field.onChange(option?.value || null)}
                placeholder=""
                isSearchable
                isClearable
              />
            )}
          />
          <span className="form-error">
            {errors.department && <span>{errors.department.message}</span>}
          </span>
        </div>

        <div>
          <label htmlFor="municipality">Municipio</label>
          <Controller
            name="municipality"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                inputId="municipality"
                className="form-select"
                classNamePrefix="react-select"
                options={municipalitiesOptions}
                value={
                  municipalitiesOptions.find(
                    (option) => option.value === field.value
                  ) || null
                }
                onChange={(option) => field.onChange(option?.value || "")}
                placeholder=""
                isSearchable
                isClearable
              />
            )}
          />
          <span className="form-error">
            {errors.municipality && <span>{errors.municipality.message}</span>}
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center">
        <div className="flex items-center">
          <input
            id="acceptTerms"
            type="checkbox"
            {...register("acceptTerms")}
          />
          <label htmlFor="acceptTerms" className="text-md cursor-pointer">
            Acepto política y autorización de datos personales.
          </label>
        </div>
        <span className="form-error">
          {errors.acceptTerms && <span>{errors.acceptTerms.message}</span>}
        </span>

        <button
          className="btn btn-primary mt-6"
          type="submit"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? "Registrando..." : "Registrar"}
        </button>
      </div>
    </form>
  );
}

export default RegisterForm;
