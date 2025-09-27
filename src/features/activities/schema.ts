import { errorMessages } from "@/constants/errorMessages";
import { z } from "zod";

export const activitySchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, errorMessages.required),
  code: z
    .string()
    .min(1, errorMessages.required)
    .max(3, errorMessages.maxLength(3)),
  date: z.date(errorMessages.dateFormat),
});

export const activityCreateSchema = activitySchema.omit({ id: true });
export const activityUpdateSchema = activitySchema.partial().extend({
  id: z.uuid(),
});
