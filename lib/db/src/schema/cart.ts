import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cartItemsTable = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull(),
  variantId: integer("variant_id").notNull(),
  productNameAr: text("product_name_ar").notNull(),
  productNameEn: text("product_name_en").notNull(),
  variantNameAr: text("variant_name_ar").notNull(),
  variantNameEn: text("variant_name_en").notNull(),
  price: real("price").notNull(),
  quantity: integer("quantity").notNull().default(1),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCartItemSchema = createInsertSchema(cartItemsTable).omit({ id: true, createdAt: true });
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItemsTable.$inferSelect;
