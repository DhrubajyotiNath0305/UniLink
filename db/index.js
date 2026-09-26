import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { pool } from "./postgres";

export const db = drizzle(pool, { schema });
