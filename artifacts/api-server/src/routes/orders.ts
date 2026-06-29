import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, cartItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
} from "@workspace/api-zod";
import { appendFileSync, existsSync } from "fs";
import { join } from "path";

const router: IRouter = Router();

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
    const escape = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
    const itemSummary = items.map((i) => `${i.productNameAr}×${i.quantity}@${i.price}`).join("; ");
    const row = [
      order.id,
      order.createdAt.toISOString(),
      escape(order.customerName),
      escape(order.customerPhone),
      escape(order.city),
      escape(order.deliveryAddress),
      escape(order.paymentMethod),
      order.subtotal.toFixed(2),
      order.deliveryFee.toFixed(2),
      order.total.toFixed(2),
      escape(order.notes ?? ""),
      escape(itemSummary),
    ].join(",") + "\n";
    appendFileSync(CSV_PATH, row, "utf8");
  } catch {
    // Non-fatal: log failure but don't block the response
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

/* ─── Create order ─── */
router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId, ...orderData } = parsed.data;

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
      customerId: orderData.customerId ?? null,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      customerPhone: orderData.customerPhone,
      deliveryAddress: orderData.deliveryAddress,
      city: orderData.city,
      notes: orderData.notes ?? null,
      paymentMethod: orderData.paymentMethod,
      status: "pending",
      subtotal,
      deliveryFee,
      total,
    })
    .returning();

  const itemInserts = cartItems.map((ci) => ({
    orderId: order.id,
    productId: ci.productId,
    variantId: ci.variantId,
    productNameAr: ci.productNameAr,
    productNameEn: ci.productNameEn,
    variantNameAr: ci.variantNameAr,
    variantNameEn: ci.variantNameEn,
    price: ci.price,
    quantity: ci.quantity,
  }));

  const items = await db.insert(orderItemsTable).values(itemInserts).returning();

  await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));

  // Append to CSV (non-blocking)
  appendOrderToCsv(order, cartItems);

  res.status(201).json(GetOrderResponse.parse({ ...order, items }));
});

/* ─── Get order by ID ─── */
router.get("/orders/:id", async (req, res): Promise<void> => {
  const params = GetOrderParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id));

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, params.data.id));

  res.json(
    GetOrderResponse.parse({
      ...order,
      createdAt: order.createdAt.toISOString(),
      items,
    })
  );
});

export default router;
