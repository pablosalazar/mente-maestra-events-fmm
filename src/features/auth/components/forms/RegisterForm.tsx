import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCreateUser } from "@/features/users/hooks";
import { Loader } from "@/components/loader/Loader";
import type { UserCreate } from "@/features/users/types";
import { userCreateSchema } from "@/features/users/schemas";
import { useAuth } from "@/hooks/useAuth";

export function RegisterForm() {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserCreate>({
    resolver: zodResolver(userCreateSchema),
  });

  const { mutateAsync: createUser, isPending } = useCreateUser();

  const onSubmit = async (data: UserCreate) => {
    try {
      const newUser = await createUser(data);

      toast.success(
        `¡Bienvenido ${newUser.name}! Te has registrado exitosamente.`
      );

      login(newUser);

      // You can redirect or perform other actions here
      console.log("User registered successfully:", newUser);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al registrar el usuario");
      }
    } finally {
      reset();
    }
  };

  return (
    <>
      {isPending && <Loader message="Registrando usuario..." />}
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="label" htmlFor="name">
            Nombre
          </label>
          <input
            {...register("name")}
            placeholder="Ingresa tu nombre"
            className="form-input"
          />
          <span className="form-error">
            {errors.name && <span>{errors.name.message}</span>}
          </span>
        </div>

        <div>
          <label className="label" htmlFor="documentNumber">
            Número de Documento
          </label>
          <input
            {...register("documentNumber")}
            placeholder="Digite su número de documento"
            className="form-input"
          />
          <span className="form-error">
            {errors.documentNumber && (
              <span>{errors.documentNumber.message}</span>
            )}
          </span>
        </div>

        <div className="text-center">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={isPending}
          >
            {isPending ? "Registrando..." : "Ingresar"}
          </button>
        </div>
      </form>
    </>
  );
}
