import { z } from "zod";
import { idParamsSchema, paginationSchema } from "./common";

export const userListQuerySchema = paginationSchema.extend({
  query: z.string().trim().max(100).optional(),
  accountType: z.enum(["student", "alumni"]).optional(),
});

export const userParamsSchema = idParamsSchema;

export const updateProfileSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required").max(100).nullish(),
    username: z.string().trim().max(50).nullish(),
    accountType: z.enum(["student", "alumni"]).nullish(),
    profilePhoto: z.string().max(5_000_000).nullish(),
    github: z.string().trim().max(300).nullish(),
    linkedin: z.string().trim().max(300).nullish(),
    location: z.string().trim().max(100).nullish(),
    college: z.string().trim().max(100).nullish(),
    graduationYear: z.coerce.number().int().min(1900).max(2100).nullish(),
    currentRole: z.string().trim().max(100).nullish(),
    company: z.string().trim().max(100).nullish(),
    bio: z.string().trim().max(1000).nullish(),
    department: z.string().trim().max(100).nullish(),
    year: z.string().trim().max(50).nullish(),
    skills: z.array(z.string().trim().min(1).max(50)).max(50).nullish(),
  })
  .strict();