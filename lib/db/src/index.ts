// @ts-nocheck
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing!");
}

const client = postgres(process.env.DATABASE_URL, { prepare: false });

import * as schema from "./schema";
export const db = drizzle(client, { schema });

export * from "./schema";
