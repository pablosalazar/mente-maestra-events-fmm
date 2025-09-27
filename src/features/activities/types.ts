import type z from "zod";
import type {
  activityCreateSchema,
  activitySchema,
  activityUpdateSchema,
} from "./schema";

export type Activity = z.infer<typeof activitySchema>;
export type ActivityCreate = z.infer<typeof activityCreateSchema>;
export type ActivityUpdate = z.infer<typeof activityUpdateSchema>;
