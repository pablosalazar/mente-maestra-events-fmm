import { z } from "zod";
import { errorMessages } from "@/constants/errorMessages";

export const userRegisterSchema = z.object({
  name: z.string().min(1, errorMessages.required),
  documentNumber: z
    .string()
    .min(1, errorMessages.required)
    .refine((val) => !isNaN(Number(val)), errorMessages.numeric),
});

export type UserRegister = z.infer<typeof userRegisterSchema>;
