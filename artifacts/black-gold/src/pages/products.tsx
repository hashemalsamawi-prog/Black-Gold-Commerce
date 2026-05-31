import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { useLang } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Products() {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const params = {
    search: search || undefined,
    categoryId: selectedCategory ?? undefined,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
  };

  const { data: products, isLoading } = useListProducts(params);
  const { data: categories } = useListCategories();

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory(null);
    setMinPrice("");
    setMaxPrice("");
  };

  const hasFilters = search || selectedCategory || minPrice || maxPrice;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="relative py-20 border-b border-border overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, hsl(45 93% 47%) 0%, transparent 60%)" }} />
        </div>
        <div className="container mx-auto px-4 max-w-screen-2xl text-center relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary tracking-[0.3em] uppercase text-sm mb-4"
          >
            {t("مجموعتنا", "Our Collection")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-wider gold-shimmer"
          >
            {t("المنتجات", "Products")}
          </motion.h1>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-screen-2xl py-12">
        {/* Search + Filter Bar */}
        <div className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("ابحث عن منتج...", "Search products...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-card border-border h-12 text-foreground placeholder:text-muted-foreground"
              data-testid="input-search"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 px-6 border-border gap-2"
            data-testid="button-toggle-filters"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("فلترة", "Filter")}
          </Button>
          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters} className="h-12 px-4 text-muted-foreground hover:text-foreground" data-testid="button-clear-filters">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-card border border-border grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">{t("الفئة", "Category")}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-1.5 text-sm border transition-all ${!selectedCategory ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                  data-testid="filter-category-all"
                >
                  {t("الكل", "All")}
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-1.5 text-sm border transition-all ${selectedCategory === cat.id ? "border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                    data-testid={`filter-category-${cat.id}`}
                  >
                    {t(cat.nameAr, cat.nameEn)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">{t("السعر الأدنى", "Min Price")}</p>
              <Input
                type="number"
                placeholder={t("من", "From")}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-background border-border"
                data-testid="input-min-price"
              />
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase text-muted-foreground mb-3">{t("السعر الأقصى", "Max Price")}</p>
              <Input
                type="number"
                placeholder={t("إلى", "To")}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-background border-border"
                data-testid="input-max-price"
              />
            </div>
          </motion.div>
        )}

        {/* Category Pills */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-5 py-2 text-xs tracking-widest uppercase border transition-all ${!selectedCategory ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
          >
            {t("الكل", "All")}
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2 text-xs tracking-widest uppercase border transition-all ${selectedCategory === cat.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
            >
              {t(cat.nameAr, cat.nameEn)}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products?.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg">{t("لا توجد منتجات", "No products found")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products?.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 8) * 0.05 }}
                data-testid={`card-product-${product.id}`}
              >
                <Link href={`/products/${product.id}`} className="group block">
                  <div className="relative aspect-square overflow-hidden bg-card border border-border mb-4">
                    <img
                      src={product.imageUrl}
                      alt={t(product.nameAr, product.nameEn)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    />
                    {product.badge && (
                      <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] tracking-widest uppercase px-3 py-1">
                        {product.badge}
                      </span>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <span className="text-xs tracking-widest uppercase border border-border px-4 py-2 text-muted-foreground">
                          {t("نفذ المخزون", "Out of Stock")}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                      {t(product.categoryNameAr ?? "", product.categoryNameEn ?? "")}
                    </p>
                    <h3 className="font-semibold text-foreground tracking-wide leading-tight group-hover:text-primary transition-colors">
                      {t(product.nameAr, product.nameEn)}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold text-lg">
                        {product.basePrice.toFixed(0)} {t("ر.س", "SAR")}
                      </span>
                      {product.rating && (
                        <span className="text-xs text-muted-foreground">
                          ★ {product.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
