import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { customersTable, ordersTable, orderItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import {
  RegisterCustomerBody,
  LoginCustomerBody,
  GetCustomerOrdersParams,
  GetCustomerProfileParams,
  LoginCustomerResponse,
  GetCustomerOrdersResponse,
  GetCustomerProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "blackgold_salt_2024").digest("hex");
}

function generateToken(customerId: number): string {
  return crypto.createHash("sha256").update(`${customerId}_${Date.now()}_blackgold`).digest("hex");
}

router.post("/customers/register", async (req, res): Promise<void> => {
  const parsed = RegisterCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, phone, password, city } = parsed.data;

  const [existing] = await db.select().from(customersTable).where(eq(customersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const [customer] = await db
    .insert(customersTable)
    .values({
      name,
      email,
      phone,
      passwordHash: hashPassword(password),
      city: city ?? null,
    })
    .returning();

  const token = generateToken(customer.id);
  const { passwordHash: _, ...safeCustomer } = customer;

  res.status(201).json(
    LoginCustomerResponse.parse({
      customer: { ...safeCustomer, createdAt: safeCustomer.createdAt.toISOString() },
      token,
    })
  );
});

router.post("/customers/login", async (req, res): Promise<void> => {
  const parsed = LoginCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [customer] = await db.select().from(customersTable).where(eq(customersTable.email, email));
  if (!customer || customer.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = generateToken(customer.id);
  const { passwordHash: _, ...safeCustomer } = customer;

  res.json(
    LoginCustomerResponse.parse({
      customer: { ...safeCustomer, createdAt: safeCustomer.createdAt.toISOString() },
      token,
    })
  );
});

router.get("/customers/:id/orders", async (req, res): Promise<void> => {
  const params = GetCustomerOrdersParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.customerId, params.data.id))
    .orderBy(ordersTable.createdAt);

  const ordersWithItems = await Promise.all(
    orders.map(async (order) => {
      const items = await db
        .select()
        .from(orderItemsTable)
        .where(eq(orderItemsTable.orderId, order.id));
      return { ...order, createdAt: order.createdAt.toISOString(), items };
    })
  );

  res.json(GetCustomerOrdersResponse.parse(ordersWithItems));
});

router.get("/customers/:id/profile", async (req, res): Promise<void> => {
  const params = GetCustomerProfileParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, params.data.id));

  if (!customer) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }

  const { passwordHash: _, ...safeCustomer } = customer;

  res.json(
    GetCustomerProfileResponse.parse({
      ...safeCustomer,
      createdAt: safeCustomer.createdAt.toISOString(),
    })
  );
});

export default router;
