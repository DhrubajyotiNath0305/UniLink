import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { ApiError } from "@/lib/api-error";

function toPublicNotification(row) {
  return {
    id: row.id,
    type: row.type,
    message: row.message,
    link: row.link,
    read: Boolean(row.read),
    createdAt: row.createdAt,
    ...(row.sender
      ? { sender: { id: row.sender.id, fullName: row.sender.fullName } }
      : {}),
  };
}

export async function createNotification({ userId, senderId, type, message, link }) {
  const [row] = await db
    .insert(notifications)
    .values({ userId, senderId: senderId ?? null, type, message, link: link ?? null })
    .returning();
  return row;
}

export async function getNotificationById(id) {
  return db.query.notifications.findFirst({
    where: (n, { eq }) => eq(n.id, id),
    with: {
      sender: {
        columns: { id: true, fullName: true },
      },
    },
  });
}

export async function listNotifications(userId, { page, limit }) {
  const rows = await db.query.notifications.findMany({
    where: (n, { eq }) => eq(n.userId, userId),
    orderBy: (n, { desc }) => desc(n.createdAt),
    limit,
    offset: (page - 1) * limit,
    with: {
      sender: {
        columns: { id: true, fullName: true },
      },
    },
  });

  const total = await db.$count(
    notifications,
    and(eq(notifications.userId, userId))
  );

  return {
    notifications: rows.map(toPublicNotification),
    total,
    page,
    limit,
  };
}

export async function getUnreadCount(userId) {
  return db.$count(
    notifications,
    and(eq(notifications.userId, userId), eq(notifications.read, false))
  );
}

export async function markNotificationAsRead(userId, id) {
  const row = await getNotificationById(id);
  if (!row) {
    throw new ApiError(404, "Notification not found", "NOT_FOUND");
  }
  if (row.userId !== userId) {
    throw new ApiError(403, "You cannot view this notification", "FORBIDDEN");
  }
  const [updated] = await db
    .update(notifications)
    .set({ read: true, updatedAt: Date.now() })
    .where(eq(notifications.id, id))
    .returning();
  return toPublicNotification({ ...updated, sender: row.sender });
}

export async function markAllNotificationsAsRead(userId) {
  await db
    .update(notifications)
    .set({ read: true, updatedAt: Date.now() })
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)))
}

export async function deleteNotification(userId, id) {
  const row = await getNotificationById(id);
  if (!row) {
    throw new ApiError(404, "Notification not found", "NOT_FOUND");
  }
  if (row.userId !== userId) {
    throw new ApiError(403, "You cannot delete this notification", "FORBIDDEN");
  }
  await db.delete(notifications).where(eq(notifications.id, id));
}

export async function clearNotifications(userId) {
  await db.delete(notifications).where(eq(notifications.userId, userId));
}
