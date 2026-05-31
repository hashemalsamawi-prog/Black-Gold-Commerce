import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const wholesaleInquiriesTable = pgTable("wholesale_inquiries", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  productInterest: text("product_interest").notNull(),
  estimatedQuantity: text("estimated_quantity").notNull(),
  message: text("message"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWholesaleInquirySchema = createInsertSchema(wholesaleInquiriesTable).omit({ id: true, createdAt: true });
export type InsertWholesaleInquiry = z.infer<typeof insertWholesaleInquirySchema>;
export type WholesaleInquiry = typeof wholesaleInquiriesTable.$inferSelect;
