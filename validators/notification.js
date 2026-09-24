import { z } from "zod";
import { idParamsSchema } from "./common";

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const notificationParamsSchema = idParamsSchema;