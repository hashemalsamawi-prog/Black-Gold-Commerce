// @ts-nocheck
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

const { Pool } = pg;

let db;

try {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing in environment variables!");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  import * as schema from "./schema";
  db = drizzle(pool, { schema });
  
  console.log("Database initialized successfully.");
} catch (error) {
  console.error("CRITICAL DATABASE ERROR:", error);
  // نضع قيمة فارغة لتجنب انهيار التطبيق تماماً، لكن ستظهر لنا الرسالة في الـ Logs
  db = null;
}

export { db };
export * from "./schema";
