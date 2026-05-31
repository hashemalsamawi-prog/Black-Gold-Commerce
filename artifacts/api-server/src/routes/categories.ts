import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { categoriesTable } from "@workspace/db";
import { ListCategoriesResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/categories", async (req, res): Promise<void> => {
  const rows = await db.select().from(categoriesTable).orderBy(categoriesTable.nameEn);
  res.json(ListCategoriesResponse.parse(rows));
});

export default router;
