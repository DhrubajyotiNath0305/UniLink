import { desc, gte } from "drizzle-orm";
import { db } from "@/db";
import { stories } from "@/db/schema";

const STORY_TTL_MS = 24 * 60 * 60 * 1000;

export function toPublicStory(story) {
  return {
    id: story.id,
    image: story.image,
    expiresAt: story.expiresAt,
    createdAt: story.createdAt,
    ...(story.user
      ? {
          user: {
            id: story.user.id,
            fullName: story.user.fullName,
            profilePhoto: story.user.profilePhoto ?? null,
          },
        }
      : {}),
  };
}

export async function createStory(userId, image) {
  const now = Date.now();
  const [row] = await db
    .insert(stories)
    .values({ userId, image, expiresAt: now + STORY_TTL_MS })
    .returning();
  const created = await db.query.stories.findFirst({
    where: (s, { eq }) => eq(s.id, row.id),
    with: {
      user: {
        columns: { id: true, fullName: true, profilePhoto: true },
      },
    },
  });
  return toPublicStory(created);
}

export async function listStories({ page, limit }) {
  const now = Date.now();
  const rows = await db.query.stories.findMany({
    where: (s, { gte }) => gte(s.expiresAt, now),
    orderBy: (s, { desc }) => [desc(s.createdAt), desc(s.id)],
    limit,
    offset: (page - 1) * limit,
    with: {
      user: {
        columns: { id: true, fullName: true, profilePhoto: true },
      },
    },
  });

  const total = await db.$count(stories, gte(stories.expiresAt, now));

  return {
    stories: rows.map(toPublicStory),
    total,
    page,
    limit,
  };
}