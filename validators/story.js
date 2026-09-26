import { z } from "zod";

export const createStorySchema = z
  .object({
    // trim() first so a whitespace-only value collapses to "" and trips min(1),
    // matching the convention used by the message and comment schemas.
    image: z.string().trim().min(1, "Story image is required").max(5_000_000),
  })
  .strict();

export const storyListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});