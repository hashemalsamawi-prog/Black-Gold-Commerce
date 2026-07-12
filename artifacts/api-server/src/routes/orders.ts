// @ts-nocheck
import { Router, type IRouter } from "express";
import { rateLimit } from "express-rate-limit";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, cartItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateOrderBody,
  GetOrderParams,
} from "@workspace/api-zod";
import { appendFileSync, existsSync } from "fs";
import { join } from "path";

const router: IRouter = Router();

/* ── Strict rate limiter for order creation: 5 per 10 minutes per IP ── */
const orderLimiter = rateLimit({
  windowMs: 10 * 60_000,
  max: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many orders submitted. Please wait before trying again." },
});

/* ── Input sanitization ── */
function sanitizeStr(s: unknown): string {
  if (typeof s !== "string") return "";
  return s
    .replace(/<[^>]*>/g, "")       // Strip HTML tags (XSS)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Strip control chars
    .trim()
    .slice(0, 500);                 // Hard length cap
}

/* ── CSV cell escaping with injection prevention ── */
function csvCell(s: string): string {
  const cleaned = String(s).replace(/[\r\n]/g, " ").trim();
  // Prefix formula-injection characters with single-quote (OWASP recommendation)
  const safe = /^[=+\-@\t]/.test(cleaned) ? `'${cleaned}` : cleaned;
  return `"${safe.replace(/"/g, '""')}"`;
}

const CSV_PATH = join(process.cwd(), "orders.csv");
const CSV_HEADER = "ID,Date,CustomerName,Phone,City,Address,PaymentMethod,Subtotal,DeliveryFee,Total,Notes,Items\n";

function appendOrderToCsv(order: {
  id: number;
  createdAt: Date;
  customerName: string;
  customerPhone: string;
  city: string;
  deliveryAddress: string;
  paymentMethod: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes: string | null;
}, items: Array<{ productNameAr: string; quantity: number; price: number }>) {
  try {
    if (!existsSync(CSV_PATH)) {
      appendFileSync(CSV_PATH, CSV_HEADER, "utf8");
    }
    const itemSummary = items.map((i) => `${i.productNameAr}×${i.quantity}@${i.price}`).join("; ");
    const row = [
      order.id,
      order.createdAt.toISOString(),
      csvCell(order.customerName),
      csvCell(order.customerPhone),
      csvCell(order.city),
      csvCell(order.deliveryAddress),
      csvCell(order.paymentMethod),
      order.subtotal.toFixed(2),
      order.deliveryFee.toFixed(2),
      order.total.toFixed(2),
      csvCell(order.notes ?? ""),
      csvCell(itemSummary),
    ].join(",") + "\n";
    appendFileSync(CSV_PATH, row, "utf8");
  } catch (err) {
    // Non-fatal: CSV logging failure must never crash the server
    // Log silently; order is already saved to DB
  }
}

/* ─── Export CSV ─── */
router.get("/orders/export/csv", (_req, res): void => {
  if (!existsSync(CSV_PATH)) {
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="orders.csv"');
    res.send(CSV_HEADER);
    return;
  }
  res.download(CSV_PATH, "orders.csv");
});

/* ─── Create order (rate-limited) ─── */
router.post("/orders", orderLimiter, async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId, ...rawOrderData } = parsed.data;

  // Server-side input sanitization (defence-in-depth)
  const orderData = {
    ...rawOrderData,
    customerName: sanitizeStr(rawOrderData.customerName),
    customerPhone: sanitizeStr(rawOrderData.customerPhone),
    customerEmail: sanitizeStr(rawOrderData.customerEmail ?? ""),
    deliveryAddress: sanitizeStr(rawOrderData.deliveryAddress),
    city: sanitizeStr(rawOrderData.city),
    notes: rawOrderData.notes ? sanitizeStr(rawOrderData.notes) : null,
  };

  if (!orderData.customerName || !orderData.customerPhone || !orderData.deliveryAddress || !orderData.city) {
    res.status(400).json({ error: "Required fields are missing or invalid." });
    return;
  }

  const cartItems = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  if (cartItems.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= 500 ? 0 : 30;
  const total = subtotal + deliveryFee;

  const [order] = await db
    .insert(ordersTable)
    .values({
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail || "guest@blackgold.sa",
      customerPhone: orderData.customerPhone,
      deliveryAddress: orderData.deliveryAddress,
      city: orderData.city,
      notes: orderData.notes,
      paymentMethod: orderData.paymentMethod,
      customerId: orderData.customerId ?? null,
      subtotal,
      deliveryFee,
      total,
      status: "pending",
    })
    .returning();

  await db.insert(orderItemsTable).values(
    cartItems.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.price,
      productNameAr: item.productNameAr,
      productNameEn: item.productNameEn,
      variantNameAr: item.variantNameAr,
      variantNameEn: item.variantNameEn,
    })),
  );

  // Clear cart
  await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));

  // Log to CSV (non-blocking)
  appendOrderToCsv(
    { ...order, subtotal, deliveryFee, total },
    cartItems.map((i) => ({
      productNameAr: i.productNameAr,
      quantity: i.quantity,
      price: i.price,
    })),
  );

  res.status(201).json({ id: order.id });
});

/* ─── Get order by ID ─── */
router.get("/orders/:id", async (req, res): Promise<void> => {
  const parsed = GetOrderParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid order ID" });
    return;
  }

  const order = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, parsed.data.id))
    .then((r) => r[0]);

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  const response = {
    ...order,
    items,
  };

  res.json(response);
});

export default router;
