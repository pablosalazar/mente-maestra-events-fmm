import { z } from "zod";
import { errorMessages } from "@/constants/errorMessages";

export const userSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1, errorMessages.required),
  username: z.string().optional(),
  avatar: z.string().optional(),
  documentNumber: z
    .string()
    .min(1, errorMessages.required)
    .refine((val) => !isNaN(Number(val)), errorMessages.numeric),
  createdAt: z.date(),
});

export const userCreateSchema = userSchema.omit({
  id: true,
  avatar: true,
  createdAt: true,
});

export const userUpdateSchema = userSchema
  .omit({
    id: true,
    createdAt: true,
  })
  .partial();
