import { z } from "zod";
import { idParamsSchema } from "./common";

export const opportunityListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const opportunityParamsSchema = idParamsSchema;

const dateRule = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .nullish();

export const createOpportunitySchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    type: z.string().trim().min(1, "Type is required").max(50),
    date: dateRule,
    banner: z.string().max(5_000_000).nullish(),
    location: z.string().trim().max(200).nullish(),
    description: z.string().trim().max(5000).nullish(),
    link: z.string().trim().max(1000).nullish(),
  })
  .strict();

export const updateOpportunitySchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    type: z.string().trim().min(1).max(50).optional(),
    date: dateRule,
    banner: z.string().max(5_000_000).nullish(),
    location: z.string().trim().max(200).nullish(),
    description: z.string().trim().max(5000).nullish(),
    link: z.string().trim().max(1000).nullish(),
  })
  .strict();