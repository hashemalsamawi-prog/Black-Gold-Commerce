import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  city: text("city").notNull(),
  notes: text("notes"),
  paymentMethod: text("payment_method").notNull(),
  status: text("status").notNull().default("pending"),
  subtotal: real("subtotal").notNull(),
  deliveryFee: real("delivery_fee").notNull().default(0),
  total: real("total").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  variantId: integer("variant_id").notNull(),
  productNameAr: text("product_name_ar").notNull(),
  productNameEn: text("product_name_en").notNull(),
  variantNameAr: text("variant_name_ar").notNull(),
  variantNameEn: text("variant_name_en").notNull(),
  price: real("price").notNull(),
  quantity: integer("quantity").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItemsTable).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;
