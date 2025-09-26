import { useActivityContext } from "../context/ActivityContext";

export function ActivityForm() {
  const { form } = useActivityContext();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <>
      <form className="space-y-4">
        <div>
          <label htmlFor="name">Evento</label>
          <input id="name" className="form-input" {...register("name")} />
          <span className="form-error">
            {errors.name && <span>{errors.name.message}</span>}
          </span>
        </div>
        <div>
          <label htmlFor="code">Código del evento</label>
          <input id="code" className="form-input" {...register("code")} />
          <span className="form-error">
            {errors.code && <span>{errors.code.message}</span>}
          </span>
        </div>

        <div>
          <label>Fecha</label>
          <input type="date" className="form-input" {...register("date")} />
          <span className="form-error">
            {errors.date && <span>{errors.date.message}</span>}
          </span>
        </div>
      </form>
    </>
  );
}
