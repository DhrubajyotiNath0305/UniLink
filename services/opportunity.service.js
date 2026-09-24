import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { opportunities } from "@/db/schema";
import { ApiError } from "@/lib/api-error";
import { toPublicUser } from "./user.service";

export function toPublicOpportunity(opportunity) {
  return {
    id: opportunity.id,
    title: opportunity.title,
    type: opportunity.type,
    date: opportunity.date ?? null,
    banner: opportunity.banner ?? null,
    location: opportunity.location ?? null,
    description: opportunity.description ?? null,
    link: opportunity.link ?? null,
    createdAt: opportunity.createdAt,
    ...(opportunity.owner
      ? { owner: toPublicUser({ ...opportunity.owner }) }
      : {}),
  };
}

function getOpportunityById(id) {
  return db.query.opportunities.findFirst({
    where: (o, { eq }) => eq(o.id, id),
    with: {
      owner: { with: { profile: true, skills: { with: { skill: true } } } },
    },
  });
}

export async function getPublicOpportunityById(id) {
  const opportunity = await getOpportunityById(id);
  if (!opportunity) {
    throw new ApiError(404, "Opportunity not found", "NOT_FOUND");
  }
  return toPublicOpportunity(opportunity);
}

export async function createOpportunity(ownerId, data) {
  const [opportunity] = await db
    .insert(opportunities)
    .values({
      ownerId,
      title: data.title,
      type: data.type,
      date: data.date ?? null,
      banner: data.banner ?? null,
      location: data.location ?? null,
      description: data.description ?? null,
      link: data.link ?? null,
    })
    .returning();
  const created = await getOpportunityById(opportunity.id);
  return toPublicOpportunity(created);
}

export async function listOpportunities({ page, limit }) {
  const rows = await db.query.opportunities.findMany({
    orderBy: (o, { desc }) => [desc(o.createdAt), desc(o.id)],
    limit,
    offset: (page - 1) * limit,
    with: {
      owner: { with: { profile: true, skills: { with: { skill: true } } } },
    },
  });

  const total = await db.$count(opportunities);

  return {
    opportunities: rows.map(toPublicOpportunity),
    total,
    page,
    limit,
  };
}

export async function updateOpportunity(opportunityId, ownerId, data) {
  const existing = await getOpportunityById(opportunityId);
  if (!existing) {
    throw new ApiError(404, "Opportunity not found", "NOT_FOUND");
  }
  if (existing.ownerId !== ownerId) {
    throw new ApiError(403, "Only the author can update this opportunity", "FORBIDDEN");
  }

  const patch = {};
  for (const key of ["title", "type", "date", "banner", "location", "description", "link"]) {
    if (data[key] !== undefined) {
      patch[key] = data[key] ?? null;
    }
  }

  await db
    .update(opportunities)
    .set({ ...patch, updatedAt: Date.now() })
    .where(eq(opportunities.id, opportunityId))
    .run();

  return getPublicOpportunityById(opportunityId);
}

export async function deleteOpportunity(opportunityId, ownerId) {
  const existing = await getOpportunityById(opportunityId);
  if (!existing) {
    throw new ApiError(404, "Opportunity not found", "NOT_FOUND");
  }
  if (existing.ownerId !== ownerId) {
    throw new ApiError(403, "Only the author can delete this opportunity", "FORBIDDEN");
  }
  await db.delete(opportunities).where(eq(opportunities.id, opportunityId)).run();
}