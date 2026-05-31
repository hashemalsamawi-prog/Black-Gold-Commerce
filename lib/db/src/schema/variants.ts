import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const variantsTable = pgTable("variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  sku: text("sku").notNull().unique(),
  stock: integer("stock").notNull().default(0),
  weightGrams: integer("weight_grams"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVariantSchema = createInsertSchema(variantsTable).omit({ id: true, createdAt: true });
export type InsertVariant = z.infer<typeof insertVariantSchema>;
export type Variant = typeof variantsTable.$inferSelect;
