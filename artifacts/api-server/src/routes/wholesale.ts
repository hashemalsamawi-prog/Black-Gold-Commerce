import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { wholesaleInquiriesTable } from "@workspace/db";
import { SubmitWholesaleInquiryBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/wholesale/inquiries", async (req, res): Promise<void> => {
  const parsed = SubmitWholesaleInquiryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [inquiry] = await db.insert(wholesaleInquiriesTable).values({
    ...parsed.data,
    message: parsed.data.message ?? null,
    status: "new",
  }).returning();
  res.status(201).json(inquiry);
});

export default router;
