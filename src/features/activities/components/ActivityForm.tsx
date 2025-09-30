import { Controller } from "react-hook-form";
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
          <label>Fecha</label>
          <Controller
            name="date"
            control={form.control}
            render={({ field: { value, onChange, ...field } }) => (
              <input
                type="date"
                className="form-input"
                value={
                  value instanceof Date && !isNaN(value.getTime())
                    ? value.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) => {
                  const dateValue = e.target.value;
                  onChange(dateValue ? new Date(dateValue) : null); // or undefined
                }}
                {...field}
              />
            )}
          />
          <span className="form-error">
            {errors.date && <span>{errors.date.message}</span>}
          </span>
        </div>
      </form>
    </>
  );
}
