import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { cartItemsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  GetCartQueryParams,
  AddToCartBody,
  UpdateCartItemParams,
  UpdateCartItemBody,
  RemoveCartItemParams,
  RemoveCartItemBody,
  ClearCartBody,
  GetCartResponse,
  UpdateCartItemResponse,
  RemoveCartItemResponse,
  ClearCartResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function buildCartResponse(sessionId: string, items: typeof cartItemsTable.$inferSelect[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { sessionId, items, subtotal, itemCount };
}

router.get("/cart", async (req, res): Promise<void> => {
  const query = GetCartQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const items = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, query.data.sessionId));

  res.json(GetCartResponse.parse(buildCartResponse(query.data.sessionId, items)));
});

router.post("/cart/items", async (req, res): Promise<void> => {
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId, productId, variantId, quantity } = parsed.data;

  const { productsTable, variantsTable } = await import("@workspace/db");

  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  const [variant] = await db.select().from(variantsTable).where(eq(variantsTable.id, variantId));

  if (!product || !variant) {
    res.status(404).json({ error: "Product or variant not found" });
    return;
  }

  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(and(eq(cartItemsTable.sessionId, sessionId), eq(cartItemsTable.variantId, variantId)));

  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({
      sessionId,
      productId,
      variantId,
      productNameAr: product.nameAr,
      productNameEn: product.nameEn,
      variantNameAr: variant.nameAr,
      variantNameEn: variant.nameEn,
      price: variant.price,
      quantity,
      imageUrl: variant.imageUrl ?? product.imageUrl,
    });
  }

  const items = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  res.status(201).json(buildCartResponse(sessionId, items));
});

router.patch("/cart/items/:itemId", async (req, res): Promise<void> => {
  const params = UpdateCartItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId, quantity } = parsed.data;

  if (quantity <= 0) {
    await db.delete(cartItemsTable).where(eq(cartItemsTable.id, params.data.itemId));
  } else {
    await db
      .update(cartItemsTable)
      .set({ quantity })
      .where(
        and(
          eq(cartItemsTable.id, params.data.itemId),
          eq(cartItemsTable.sessionId, sessionId)
        )
      );
  }

  const items = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  res.json(UpdateCartItemResponse.parse(buildCartResponse(sessionId, items)));
});

router.delete("/cart/items/:itemId", async (req, res): Promise<void> => {
  const params = RemoveCartItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = RemoveCartItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId } = parsed.data;

  await db
    .delete(cartItemsTable)
    .where(
      and(eq(cartItemsTable.id, params.data.itemId), eq(cartItemsTable.sessionId, sessionId))
    );

  const items = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  res.json(RemoveCartItemResponse.parse(buildCartResponse(sessionId, items)));
});

router.delete("/cart/clear", async (req, res): Promise<void> => {
  const parsed = ClearCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sessionId } = parsed.data;

  await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));

  res.json(ClearCartResponse.parse(buildCartResponse(sessionId, [])));
});

export default router;
