import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const now = sql`(unixepoch() * 1000)`;

const timestamps = {
  createdAt: integer("created_at").notNull().default(now),
  updatedAt: integer("updated_at").notNull().default(now),
};

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    fullName: text("full_name").notNull(),
    username: text("username"),
    accountType: text("account_type", { enum: ["student", "alumni"] })
      .notNull()
      .default("student"),
    profilePhoto: text("profile_photo"),
    github: text("github"),
    linkedin: text("linkedin"),
    location: text("location"),
    college: text("college"),
    graduationYear: integer("graduation_year"),
    currentRole: text("current_role"),
    company: text("company"),
    ...timestamps,
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)]
);

export const profiles = sqliteTable("profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio"),
  department: text("department"),
  year: text("year"),
  ...timestamps,
});

export const skills = sqliteTable(
  "skills",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
  },
  (table) => [uniqueIndex("skills_name_unique").on(table.name)]
);

export const userSkills = sqliteTable(
  "user_skills",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    skillId: integer("skill_id")
      .notNull()
      .references(() => skills.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey(table.userId, table.skillId)]
);

export const connections = sqliteTable(
  "connections",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    requesterId: integer("requester_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    addresseeId: integer("addressee_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    pairKey: text("pair_key").notNull(),
    status: text("status", { enum: ["pending", "accepted", "rejected"] })
      .notNull()
      .default("pending"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("connections_pair_key_unique").on(table.pairKey),
    index("connections_requester_idx").on(table.requesterId),
    index("connections_addressee_idx").on(table.addresseeId),
  ]
);

export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    image: text("image"),
    likes: integer("likes").notNull().default(0),
    comments: integer("comments").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("posts_user_idx").on(table.userId),
    index("posts_created_idx").on(table.createdAt),
  ]
);

export const postLikes = sqliteTable(
  "post_likes",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    createdAt: integer("created_at").notNull().default(now),
  },
  (table) => [
    primaryKey(table.userId, table.postId),
    index("post_likes_post_idx").on(table.postId),
  ]
);

export const comments = sqliteTable(
  "comments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    ...timestamps,
  },
  (table) => [
    index("comments_post_idx").on(table.postId),
    index("comments_user_idx").on(table.userId),
  ]
);

export const opportunities = sqliteTable(
  "opportunities",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ownerId: integer("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    type: text("type").notNull(),
    date: text("date"),
    banner: text("banner"),
    location: text("location"),
    description: text("description"),
    link: text("link"),
    ...timestamps,
  },
  (table) => [
    index("opportunities_owner_idx").on(table.ownerId),
    index("opportunities_created_idx").on(table.createdAt),
  ]
);

export const notifications = sqliteTable(
  "notifications",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    senderId: integer("sender_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    type: text("type").notNull(),
    message: text("message").notNull(),
    link: text("link"),
    read: integer("read").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("notifications_user_idx").on(table.userId),
    index("notifications_read_idx").on(table.read),
  ]
);

export const messages = sqliteTable(
  "messages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    senderId: integer("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    receiverId: integer("receiver_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    read: integer("read").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("messages_sender_idx").on(table.senderId),
    index("messages_receiver_idx").on(table.receiverId),
  ]
);

export const stories = sqliteTable(
  "stories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    image: text("image").notNull(),
    expiresAt: integer("expires_at").notNull(),
    ...timestamps,
  },
  (table) => [index("stories_user_idx").on(table.userId)]
);

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: integer("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  technologies: text("technologies"),
  github: text("github"),
  demo: text("demo"),
  ...timestamps,
});

export const projectMembers = sqliteTable(
  "project_members",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["member", "owner"] }).notNull().default("member"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("project_members_project_user_unique").on(
      table.projectId,
      table.userId
    ),
    index("project_members_user_idx").on(table.userId),
  ]
);

export const projectJoinRequests = sqliteTable(
  "project_join_requests",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status", { enum: ["pending", "accepted", "rejected"] })
      .notNull()
      .default("pending"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("project_join_requests_project_user_unique").on(
      table.projectId,
      table.userId
    ),
    index("project_join_requests_user_idx").on(table.userId),
  ]
);

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [users.id],
    references: [profiles.userId],
  }),
  skills: many(userSkills),
  posts: many(posts),
  connections: many(connections),
  projects: many(projects, { relationName: "ownedProjects" }),
  memberships: many(projectMembers),
  joinRequests: many(projectJoinRequests),
  opportunities: many(opportunities, { relationName: "ownedOpportunities" }),
  notifications: many(notifications, { relationName: "receivedNotifications" }),
  sentNotifications: many(notifications, { relationName: "sentNotifications" }),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
  stories: many(stories),
  postLikes: many(postLikes),
  comments: many(comments),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  userSkills: many(userSkills),
}));

export const userSkillsRelations = relations(userSkills, ({ one }) => ({
  user: one(users, {
    fields: [userSkills.userId],
    references: [users.id],
  }),
  skill: one(skills, {
    fields: [userSkills.skillId],
    references: [skills.id],
  }),
}));

export const connectionsRelations = relations(connections, ({ one }) => ({
  requester: one(users, {
    fields: [connections.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  addressee: one(users, {
    fields: [connections.addresseeId],
    references: [users.id],
    relationName: "addressee",
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  likes: many(postLikes),
  comments: many(comments),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const opportunitiesRelations = relations(opportunities, ({ one }) => ({
  owner: one(users, {
    fields: [opportunities.ownerId],
    references: [users.id],
    relationName: "ownedOpportunities",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
    relationName: "receivedNotifications",
  }),
  sender: one(users, {
    fields: [notifications.senderId],
    references: [users.id],
    relationName: "sentNotifications",
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
}));

export const storiesRelations = relations(stories, ({ one }) => ({
  user: one(users, {
    fields: [stories.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
    relationName: "ownedProjects",
  }),
  members: many(projectMembers),
  joinRequests: many(projectJoinRequests),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}));

export const projectJoinRequestsRelations = relations(
  projectJoinRequests,
  ({ one }) => ({
    project: one(projects, {
      fields: [projectJoinRequests.projectId],
      references: [projects.id],
    }),
    user: one(users, {
      fields: [projectJoinRequests.userId],
      references: [users.id],
    }),
  })
);
