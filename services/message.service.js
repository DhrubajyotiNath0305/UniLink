import { and, count, desc, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { connections, messages, users } from "@/db/schema";
import { ApiError } from "@/lib/api-error";
import { createNotification } from "./notification.service";

function toPublicMessage(row) {
  return {
    id: row.id,
    senderId: row.senderId,
    receiverId: row.receiverId,
    text: row.text,
    read: Boolean(row.read),
    createdAt: row.createdAt,
  };
}

function peerProfileKey(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    profile: user.profile
      ? {
          bio: user.profile.bio,
          department: user.profile.department,
          year: user.profile.year,
        }
      : null,
  };
}

async function areConnected(a, b) {
  const row = await db.query.connections.findFirst({
    where: (c, { and, eq }) =>
      and(
        eq(c.pairKey, [a, b].sort((x, y) => x - y).join(":")),
        eq(c.status, "accepted")
      ),
  });
  return Boolean(row);
}

export async function sendMessage({ senderId, receiverId, text }) {
  if (senderId === receiverId) {
    throw new ApiError(400, "You cannot message yourself", "SELF_MESSAGE");
  }

  const receiver = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, receiverId),
  });
  if (!receiver) {
    throw new ApiError(404, "User not found", "NOT_FOUND");
  }

  const connected = await areConnected(senderId, receiverId);
  if (!connected) {
    throw new ApiError(
      403,
      "You can only message people you are connected with",
      "NOT_CONNECTED"
    );
  }

  const [row] = await db
    .insert(messages)
    .values({ senderId, receiverId, text })
    .returning();

  const sender = await db
    .select({ fullName: users.fullName })
    .from(users)
    .where(eq(users.id, senderId))
    .limit(1);

  await createNotification({
    userId: receiverId,
    senderId,
    type: "message",
    message: `${sender[0]?.fullName ?? "A user"} sent you a message.`,
    link: `/messages/${senderId}`,
  });

  return toPublicMessage(row);
}

export async function listConversation(userId, otherUserId, { page, limit }) {
  const between = and(
    or(
      and(eq(messages.senderId, userId), eq(messages.receiverId, otherUserId)),
      and(eq(messages.senderId, otherUserId), eq(messages.receiverId, userId))
    )
  );

  const rows = await db
    .select()
    .from(messages)
    .where(between)
    .orderBy(desc(messages.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const total = await db.$count(messages, between);

  return {
    messages: rows.map(toPublicMessage),
    total,
    page,
    limit,
  };
}

export async function markConversationAsRead(userId, otherUserId) {
  await db
    .update(messages)
    .set({ read: 1, updatedAt: Date.now() })
    .where(
      and(eq(messages.receiverId, userId), eq(messages.senderId, otherUserId))
    )
    .run();
}

export async function getUnreadCount(userId) {
  return db.$count(
    messages,
    and(eq(messages.receiverId, userId), eq(messages.read, 0))
  );
}

export async function listConversations(userId, { page, limit }) {
  const peerSql = `
         SELECT DISTINCT peer_id FROM (
            SELECT receiver_id AS peer_id FROM messages WHERE sender_id = ?
            UNION
            SELECT sender_id AS peer_id FROM messages WHERE receiver_id = ?
          ) ORDER BY peer_id DESC LIMIT ? OFFSET ?`;

  const countSql = `
         SELECT COUNT(*) AS total FROM (
            SELECT DISTINCT receiver_id AS peer_id FROM messages WHERE sender_id = ?
            UNION
            SELECT DISTINCT sender_id AS peer_id FROM messages WHERE receiver_id = ?
          )`;

  const [peerRows, totalResult] = await Promise.all([
    db.execute({ sql: peerSql, args: [userId, userId, limit, (page - 1) * limit] }),
    db.execute({ sql: countSql, args: [userId, userId] }),
  ]);

  const total = Number(totalResult.rows[0]?.total ?? 0);
  const peerIds = peerRows.rows.map((row) => Number(row.peer_id));

  const conversations = [];
  for (const peerId of peerIds) {
    const [peer, latestRows, unreadRows] = await Promise.all([
      db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, peerId),
        with: { profile: true },
      }),
      db
        .select()
        .from(messages)
        .where(
          or(
            and(eq(messages.senderId, userId), eq(messages.receiverId, peerId)),
            and(eq(messages.senderId, peerId), eq(messages.receiverId, userId))
          )
        )
        .orderBy(desc(messages.createdAt))
        .limit(1),
      db
        .select({ count: count() })
        .from(messages)
        .where(
          and(
            eq(messages.senderId, peerId),
            eq(messages.receiverId, userId),
            eq(messages.read, 0)
          )
        ),
    ]);

    if (!peer) {
      continue;
    }

    conversations.push({
      user: peerProfileKey(peer),
      latestMessage: latestRows[0] ? toPublicMessage(latestRows[0]) : null,
      unreadCount: Number(unreadRows[0]?.count ?? 0),
    });
  }

  return {
    conversations,
    total,
    page,
    limit,
  };
}