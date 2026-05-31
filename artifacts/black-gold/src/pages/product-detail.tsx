import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ShoppingBag, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useGetProduct,
  getGetProductQueryKey,
  useGetRelatedProducts,
  getGetRelatedProductsQueryKey,
  useAddToCart,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLang } from "@/contexts/LanguageContext";
import { useCartSession } from "@/hooks/use-cart-session";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const id = parseInt(params?.id ?? "0", 10);
  const { t } = useLang();
  const sessionId = useCartSession();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [imageIdx, setImageIdx] = useState(0);

  const { data: product, isLoading } = useGetProduct(id, {
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id) },
  });

  const { data: related } = useGetRelatedProducts(id, {
    query: { enabled: !!id, queryKey: getGetRelatedProductsQueryKey(id) },
  });

  const addToCart = useAddToCart();

  const selectedVariant = product?.variants?.find((v) => v.id === selectedVariantId) ?? product?.variants?.[0];

  const currentPrice = selectedVariant?.price ?? product?.basePrice ?? 0;
  const images = [product?.imageUrl, ...(product?.gallery ?? [])].filter(Boolean) as string[];

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addToCart.mutate(
      {
        data: {
          sessionId,
          productId: product.id,
          variantId: selectedVariant.id,
          quantity,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
          toast({
            title: t("تمت الإضافة إلى السلة", "Added to cart"),
            description: t(product.nameAr, product.nameEn),
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 max-w-screen-2xl py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">{t("المنتج غير موجود", "Product not found")}</p>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 max-w-screen-2xl py-6 border-b border-border">
        <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">{t("الرئيسية", "Home")}</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary transition-colors">{t("المنتجات", "Products")}</Link>
          <span>/</span>
          <span className="text-foreground">{t(product.nameAr, product.nameEn)}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-screen-2xl py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-square overflow-hidden bg-card border border-border group">
              <img
                src={images[imageIdx]}
                alt={t(product.nameAr, product.nameEn)}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-[10px] tracking-widest uppercase px-3 py-1">
                  {product.badge}
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImageIdx((i) => Math.max(0, i - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 border border-border p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setImageIdx((i) => Math.min(images.length - 1, i + 1))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 border border-border p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIdx(i)}
                    className={`w-20 h-20 overflow-hidden border-2 transition-all ${i === imageIdx ? "border-primary" : "border-border opacity-50 hover:opacity-80"}`}
                    data-testid={`img-gallery-${i}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-3">
              {t(product.categoryNameAr ?? "", product.categoryNameEn ?? "")}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-wide text-foreground mb-4">
              {t(product.nameAr, product.nameEn)}
            </h1>

            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={i < Math.floor(product.rating ?? 0) ? "text-primary" : "text-muted"}>★</span>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">({product.reviewCount} {t("تقييم", "reviews")})</span>
              </div>
            )}

            <div className="gold-divider my-6" />

            <p className="text-muted-foreground leading-relaxed mb-8">
              {t(product.descriptionAr, product.descriptionEn)}
            </p>

            {/* Variant Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-8">
                <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">
                  {t("اختر الحجم / النوع", "Select Size / Type")}
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`px-5 py-3 border text-sm transition-all ${
                        (selectedVariantId ?? product.variants?.[0]?.id) === variant.id
                          ? "border-primary text-primary bg-accent"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      } ${variant.stock === 0 ? "opacity-40 cursor-not-allowed" : ""}`}
                      disabled={variant.stock === 0}
                      data-testid={`button-variant-${variant.id}`}
                    >
                      <span className="block">{t(variant.nameAr, variant.nameEn)}</span>
                      <span className="block text-xs mt-0.5 text-primary">{variant.price.toFixed(0)} {t("ر.س", "SAR")}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-8">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary" data-testid="text-price">
                  {currentPrice.toFixed(0)}
                </span>
                <span className="text-xl text-muted-foreground">{t("ر.س", "SAR")}</span>
                {selectedVariant?.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {selectedVariant.originalPrice.toFixed(0)} {t("ر.س", "SAR")}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">{t("الكمية", "Quantity")}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-12 w-12 flex items-center justify-center hover:bg-accent transition-colors"
                    data-testid="button-decrease-quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="h-12 w-16 flex items-center justify-center text-foreground font-medium border-x border-border" data-testid="text-quantity">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="h-12 w-12 flex items-center justify-center hover:bg-accent transition-colors"
                    data-testid="button-increase-quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("للطلبات بالجملة، تواصل معنا", "For bulk orders, contact us")}
                </p>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock || addToCart.isPending}
                className="flex-1 h-14 text-sm tracking-widest uppercase gap-3 bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-add-to-cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {addToCart.isPending
                  ? t("جاري الإضافة...", "Adding...")
                  : !product.inStock
                  ? t("نفذ المخزون", "Out of Stock")
                  : t("أضف إلى السلة", "Add to Cart")}
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/wholesale")}
                className="h-14 px-6 text-xs tracking-widest uppercase border-border"
                data-testid="button-wholesale-inquiry"
              >
                {t("الجملة", "Wholesale")}
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 pt-8 border-t border-border grid grid-cols-3 gap-4">
              {[
                { ar: "توصيل سريع", en: "Fast Delivery" },
                { ar: "جودة مضمونة", en: "Quality Assured" },
                { ar: "دعم 24/7", en: "24/7 Support" },
              ].map((badge, i) => (
                <div key={i} className="text-center">
                  <p className="text-[10px] tracking-widest uppercase text-primary">{t(badge.ar, badge.en)}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {related && related.length > 0 && (
          <div className="mt-24">
            <div className="text-center mb-12">
              <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-3">{t("قد يعجبك أيضاً", "You may also like")}</p>
              <h2 className="text-2xl font-bold tracking-wider">{t("منتجات مشابهة", "Related Products")}</h2>
              <div className="gold-divider w-24 mx-auto mt-4" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link href={`/products/${product.id}`} className="group block">
                    <div className="aspect-square overflow-hidden bg-card border border-border mb-3">
                      <img
                        src={product.imageUrl}
                        alt={t(product.nameAr, product.nameEn)}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                      />
                    </div>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {t(product.nameAr, product.nameEn)}
                    </h3>
                    <p className="text-primary mt-1">{product.basePrice.toFixed(0)} {t("ر.س", "SAR")}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
