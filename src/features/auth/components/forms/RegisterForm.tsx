import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  userRegisterSchema,
  type UserRegister,
} from "../../shemas/registerSchema";

export function RegisterForm() {
  const {
    register,
    formState: { errors },
  } = useForm<UserRegister>({
    resolver: zodResolver(userRegisterSchema),
  });

  return (
    <>
      <form className="space-y-4">
        <div>
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
          <button className="btn btn-primary" type="submit">
            Ingresar
          </button>
        </div>
      </form>
    </>
  );
}
