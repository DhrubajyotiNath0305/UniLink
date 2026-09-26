import { defineConfig } from "drizzle-kit";

// Migrations must run on a direct (unpooled) connection: the transaction mode
// pooler in front of managed Postgres cannot hold a session open across the
// whole migration. Runtime code uses DATABASE_URL instead.
const directUrl = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;

if (!directUrl) {
  throw new Error(
    "DIRECT_DATABASE_URL (or DATABASE_URL) must be set to run drizzle-kit commands."
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/index.js",
  out: "./db/migrations",
  dbCredentials: {
    url: directUrl,
    ...(process.env.DATABASE_SSL === "disable"
      ? {}
      : { ssl: process.env.DATABASE_SSL === "require" ? "require" : "prefer" }),
  },
});
