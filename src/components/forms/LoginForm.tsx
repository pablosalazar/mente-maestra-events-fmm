import type z from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader } from "@/components/loader/Loader";
import { loginSchema } from "@/schemas/loginSchema";
import { loginUser } from "@/services/auth.service";
import { checkUserAlreadyPlayed } from "@/services/userScore.service";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router";

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginSchema>) => {
      // Verificar si el usuario ya ha jugado
      const hasPlayed = await checkUserAlreadyPlayed(data.documentNumber);
      if (hasPlayed) {
        throw new Error("Ya has participado en el juego");
      }

      // Si no ha jugado, proceder con el login
      return loginUser(data.documentNumber);
    },
    onSuccess: (result) => {
      reset();
      login(result);
      navigate("/elige-avatar");
    },
    onError: (error) => {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al iniciar sesión");
      }
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof loginSchema>> = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name">Nombre completo</label>
          <input
            id="name"
            className="form-input"
            placeholder="Digite su nombre completo"
            {...register("name")}
          />
          <span className="form-error">
            {errors.name && <span>{errors.name.message}</span>}
          </span>
        </div>
        <div>
          <label htmlFor="documentNumber">Número de documento</label>
          <input
            {...register("documentNumber")}
            placeholder="Digite su número de documento"
            className="form-input"
            disabled={loginMutation.isPending}
          />
          <span className="form-error">
            {errors.documentNumber && (
              <span>{errors.documentNumber.message}</span>
            )}
          </span>
        </div>
        <div>
          <label htmlFor="code">Código institución</label>
          <input
            id="code"
            className="form-input"
            placeholder="Digite su código de acceso"
            {...register("code")}
          />
          <span className="form-error">
            {errors.code && <span>{errors.code.message}</span>}
          </span>
        </div>

        <div className="text-center">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Verificando..." : "Ingresar"}
          </button>
        </div>
      </form>

      {loginMutation.isPending && <Loader message="Verificando usuario..." />}
    </>
  );
}
