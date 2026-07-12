// @ts-nocheck
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

import * as schema from "./schema/index.js";
export const db = drizzle(pool, { schema });

export * from "./schema/index.js";.
