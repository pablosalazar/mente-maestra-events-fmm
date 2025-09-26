import { z } from "zod";
import { errorMessages } from "@/constants/errorMessages";

export const loginSchema = z.object({
  name: z.string().min(1, errorMessages.required),
  documentNumber: z
    .string()
    .min(1, errorMessages.required)
    .refine((val) => !isNaN(Number(val)), errorMessages.numeric),
  code: z.string().min(1, errorMessages.required),
});
