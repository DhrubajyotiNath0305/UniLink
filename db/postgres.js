import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and point it at a Postgres instance."
  );
}

// Managed Postgres providers (Neon, Supabase, ...) front the database with a
// transaction mode pooler, so the pooler -- not this number -- is the real
// connection ceiling. Keep the pool small and let it queue.
const poolConfig = {
  connectionString,
  max: Number(process.env.DATABASE_POOL_MAX) || (process.env.NODE_ENV === "production" ? 10 : 3),
  // TLS is negotiated from the connection string when it carries an sslmode
  // parameter. DATABASE_SSL is only needed to force or disable it explicitly,
  // e.g. "require" to skip certificate verification against a self-signed
  // provider chain.
  ...(process.env.DATABASE_SSL === "disable"
    ? {}
    : { ssl: process.env.DATABASE_SSL === "require" ? { rejectUnauthorized: false } : undefined }),
};

// `next dev` re-evaluates modules on hot reload. Without a global singleton we
// would open a fresh pool on every edit and exhaust the provider's connection
// limit, so the pool is cached on globalThis in development only.
const globalForDb = globalThis;

export const pool =
  process.env.NODE_ENV === "production"
    ? new Pool(poolConfig)
    : (globalForDb.__unilinkPool ??= new Pool(poolConfig));

if (process.env.NODE_ENV !== "production") {
  globalForDb.__unilinkPool = pool;
}
