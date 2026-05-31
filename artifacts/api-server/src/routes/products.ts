import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { productsTable, categoriesTable, variantsTable } from "@workspace/db";
import { eq, and, gte, lte, like, or } from "drizzle-orm";
import {
  ListProductsQueryParams,
  GetProductParams,
  GetRelatedProductsParams,
  ListProductsResponse,
  GetFeaturedProductsResponse,
  GetCatalogSummaryResponse,
  GetProductResponse,
  GetRelatedProductsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/products", async (req, res): Promise<void> => {
  const query = ListProductsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { categoryId, search, minPrice, maxPrice, inStock, featured } = query.data;

  const conditions = [];
  if (categoryId != null) conditions.push(eq(productsTable.categoryId, categoryId));
  if (inStock != null) conditions.push(eq(productsTable.inStock, inStock));
  if (featured != null) conditions.push(eq(productsTable.featured, featured));
  if (minPrice != null) conditions.push(gte(productsTable.basePrice, minPrice));
  if (maxPrice != null) conditions.push(lte(productsTable.basePrice, maxPrice));
  if (search) {
    conditions.push(
      or(
        like(productsTable.nameAr, `%${search}%`),
        like(productsTable.nameEn, `%${search}%`),
        like(productsTable.descriptionAr, `%${search}%`),
        like(productsTable.descriptionEn, `%${search}%`)
      )!
    );
  }

  const products = await db
    .select({
      id: productsTable.id,
      nameAr: productsTable.nameAr,
      nameEn: productsTable.nameEn,
      descriptionAr: productsTable.descriptionAr,
      descriptionEn: productsTable.descriptionEn,
      categoryId: productsTable.categoryId,
      categoryNameAr: categoriesTable.nameAr,
      categoryNameEn: categoriesTable.nameEn,
      basePrice: productsTable.basePrice,
      imageUrl: productsTable.imageUrl,
      gallery: productsTable.gallery,
      inStock: productsTable.inStock,
      featured: productsTable.featured,
      slug: productsTable.slug,
      rating: productsTable.rating,
      reviewCount: productsTable.reviewCount,
      badge: productsTable.badge,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(productsTable.featured, productsTable.createdAt);

  res.json(ListProductsResponse.parse(products));
});

router.get("/products/featured", async (_req, res): Promise<void> => {
  const products = await db
    .select({
      id: productsTable.id,
      nameAr: productsTable.nameAr,
      nameEn: productsTable.nameEn,
      descriptionAr: productsTable.descriptionAr,
      descriptionEn: productsTable.descriptionEn,
      categoryId: productsTable.categoryId,
      categoryNameAr: categoriesTable.nameAr,
      categoryNameEn: categoriesTable.nameEn,
      basePrice: productsTable.basePrice,
      imageUrl: productsTable.imageUrl,
      gallery: productsTable.gallery,
      inStock: productsTable.inStock,
      featured: productsTable.featured,
      slug: productsTable.slug,
      rating: productsTable.rating,
      reviewCount: productsTable.reviewCount,
      badge: productsTable.badge,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.featured, true))
    .limit(8);

  res.json(GetFeaturedProductsResponse.parse(products));
});

router.get("/products/catalog-summary", async (_req, res): Promise<void> => {
  const allProducts = await db.select().from(productsTable);
  const allCategories = await db.select().from(categoriesTable);

  const totalProducts = allProducts.length;
  const totalCategories = allCategories.length;
  const inStockCount = allProducts.filter((p) => p.inStock).length;
  const featuredCount = allProducts.filter((p) => p.featured).length;

  const categoryBreakdown = allCategories.map((cat) => ({
    categoryId: cat.id,
    nameAr: cat.nameAr,
    nameEn: cat.nameEn,
    count: allProducts.filter((p) => p.categoryId === cat.id).length,
  }));

  res.json(
    GetCatalogSummaryResponse.parse({
      totalProducts,
      totalCategories,
      inStockCount,
      featuredCount,
      categoryBreakdown,
    })
  );
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const params = GetProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [product] = await db
    .select({
      id: productsTable.id,
      nameAr: productsTable.nameAr,
      nameEn: productsTable.nameEn,
      descriptionAr: productsTable.descriptionAr,
      descriptionEn: productsTable.descriptionEn,
      categoryId: productsTable.categoryId,
      categoryNameAr: categoriesTable.nameAr,
      categoryNameEn: categoriesTable.nameEn,
      basePrice: productsTable.basePrice,
      imageUrl: productsTable.imageUrl,
      gallery: productsTable.gallery,
      inStock: productsTable.inStock,
      featured: productsTable.featured,
      slug: productsTable.slug,
      rating: productsTable.rating,
      reviewCount: productsTable.reviewCount,
      badge: productsTable.badge,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, params.data.id));

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const variants = await db
    .select()
    .from(variantsTable)
    .where(eq(variantsTable.productId, params.data.id));

  res.json(GetProductResponse.parse({ ...product, variants }));
});

router.get("/products/:id/related", async (req, res): Promise<void> => {
  const params = GetRelatedProductsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [currentProduct] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, params.data.id));

  if (!currentProduct) {
    res.json(GetRelatedProductsResponse.parse([]));
    return;
  }

  const related = await db
    .select({
      id: productsTable.id,
      nameAr: productsTable.nameAr,
      nameEn: productsTable.nameEn,
      descriptionAr: productsTable.descriptionAr,
      descriptionEn: productsTable.descriptionEn,
      categoryId: productsTable.categoryId,
      categoryNameAr: categoriesTable.nameAr,
      categoryNameEn: categoriesTable.nameEn,
      basePrice: productsTable.basePrice,
      imageUrl: productsTable.imageUrl,
      gallery: productsTable.gallery,
      inStock: productsTable.inStock,
      featured: productsTable.featured,
      slug: productsTable.slug,
      rating: productsTable.rating,
      reviewCount: productsTable.reviewCount,
      badge: productsTable.badge,
    })
    .from(productsTable)
    .leftJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(
      and(
        eq(productsTable.categoryId, currentProduct.categoryId),
        eq(productsTable.inStock, true)
      )
    )
    .limit(4);

  const filtered = related.filter((p) => p.id !== params.data.id);
  res.json(GetRelatedProductsResponse.parse(filtered));
});

export default router;
