import { z } from "zod";
import { errorMessages } from "@/constants/errorMessages";

export const userSchema = z.object({
  id: z.uuid(),
  name: z
    .string()
    .min(3, errorMessages.minLength(3))
    .max(50, errorMessages.maxLength(50)),
  username: z.string().optional(),
  avatar: z.string().optional(),
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
