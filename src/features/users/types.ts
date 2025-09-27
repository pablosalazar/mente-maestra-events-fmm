import type z from "zod";
import type { userCreateSchema, userSchema } from "./schemas";

export type User = z.infer<typeof userSchema>;
export type UserCreate = z.infer<typeof userCreateSchema>;
