import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { ordersTable, orderItemsTable, cartItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateOrderBody,
  GetOrderParams,
  GetOrderResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

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

  res.status(201).json(GetOrderResponse.parse({ ...order, items }));
});

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
