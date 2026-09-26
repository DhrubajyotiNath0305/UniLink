# UniLink

A campus social network for students: posts, connections, messaging, opportunities, projects and stories. Built with Next.js (App Router) and PostgreSQL via Drizzle ORM.

## Stack

- **Next.js 16** (App Router, React 19) and Tailwind CSS 4
- **PostgreSQL** with [Drizzle ORM](https://orm.drizzle.team) using the `pg` driver
- **Zod** for request validation, custom JWT cookie auth

## Requirements

- Node.js 20+
- A PostgreSQL database (a local Docker container is fine for development)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your environment file:

   ```bash
   cp .env.example .env
   ```

   Then fill in the values. You need at minimum:

   | Variable | Purpose |
   | --- | --- |
   | `DATABASE_URL` | Pooled connection used by the app at runtime |
   | `DIRECT_DATABASE_URL` | Unpooled connection used by migrations and the e2e suite |
   | `JWT_SECRET` | Signing key for session tokens |

   Generate a secret with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```

   On **Neon**, `DATABASE_URL` should point at the pooled host (it ends in
   `-pooler.<region>.aws.neon.tech`) and `DIRECT_DATABASE_URL` at the direct
   host. A transaction-mode pooler cannot hold a session open for the length of
   a migration, so migrations must bypass it.

3. Create the tables:

   ```bash
   npm run db:migrate
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

   Then open [http://localhost:3000](http://localhost:3000).

### Local database with Docker

```bash
docker run -d --name unilink-pg \
  -e POSTGRES_USER=unilink \
  -e POSTGRES_PASSWORD=unilink \
  -e POSTGRES_DB=unilink \
  -p 5432:5432 postgres:17-alpine
```

Point both `DATABASE_URL` and `DIRECT_DATABASE_URL` at
`postgresql://unilink:unilink@localhost:5432/unilink`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run test:api` | API end-to-end tests against a real database |
| `npm run db:generate` | Generate a migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Push the schema directly, skipping migrations |

## Testing

`npm test` runs the unit suite and needs no database.

`npm run test:api` is different: it **creates and deletes real records** in
whatever database `DIRECT_DATABASE_URL` points at, and will refuse to start
unless you opt in explicitly.

```bash
API_TEST_ALLOW_LIVE=1 npm run test:api
```

Add `API_TEST_ALLOW_LOCAL=1` to skip the loud warning banner when the target is
a throwaway database on localhost. Never point this at a database you care
about. Each run tags its fixtures with a unique id and removes them during
teardown, but it is still a destructive suite.

## Schema notes

Timestamps are stored as epoch milliseconds in a `bigint` column and mapped to
JavaScript numbers, so the JSON API returns plain numbers and the client can
keep using `new Date(ts)`. They are deliberately not `timestamptz`; if you
change that, every `new Date(...)` call site needs revisiting.

User search uses `ILIKE` because PostgreSQL's `LIKE` is case-sensitive, unlike
SQLite's default ASCII behaviour.
