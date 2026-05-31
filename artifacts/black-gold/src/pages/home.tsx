import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck, Star, Users } from "lucide-react";
import {
  useGetFeaturedProducts,
  useListCategories,
  useGetCatalogSummary,
} from "@workspace/api-client-react";
import { useLang } from "@/contexts/LanguageContext";

export default function Home() {
  const { t } = useLang();
  const { data: featured } = useGetFeaturedProducts();
  const { data: categories } = useListCategories();
  const { data: summary } = useGetCatalogSummary();

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at 60% 50%, hsl(45 93% 15% / 0.6) 0%, transparent 70%), radial-gradient(ellipse at 20% 80%, hsl(45 50% 8% / 0.4) 0%, transparent 60%)",
            }}
          />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 60px, hsl(45 93% 47% / 0.5) 60px, hsl(45 93% 47% / 0.5) 61px), repeating-linear-gradient(90deg, transparent, transparent 60px, hsl(45 93% 47% / 0.3) 60px, hsl(45 93% 47% / 0.3) 61px)" }} />
        </div>

        <div className="relative z-10 container mx-auto px-4 max-w-screen-xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-block text-[10px] tracking-[0.4em] uppercase text-primary border border-primary/30 px-6 py-2">
              {t("منذ عام 2010 — الجودة تتحدث عن نفسها", "Since 2010 — Quality Speaks for Itself")}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-widest mb-4 leading-none"
          >
            <span className="gold-shimmer">
              {t("الذهب", "BLACK")}
            </span>
            <br />
            <span className="gold-shimmer">
              {t("الأسود", "GOLD")}
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="gold-divider w-32 mx-auto my-8"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground text-lg md:text-xl tracking-widest max-w-xl mx-auto mb-12"
          >
            {t(
              "أجود المنتجات الفاخرة، من قلب الطبيعة إلى يديك",
              "The finest premium products, from nature's heart to your hands"
            )}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/products"
              className="inline-flex h-14 items-center justify-center gap-3 bg-primary text-primary-foreground px-10 text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors"
              data-testid="link-shop-now"
            >
              {t("تسوق الآن", "Shop Now")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/wholesale"
              className="inline-flex h-14 items-center justify-center gap-3 border border-border text-foreground px-10 text-sm tracking-widest uppercase hover:border-primary/50 transition-colors"
              data-testid="link-wholesale"
            >
              {t("طلبات الجملة", "Wholesale")}
            </Link>
          </motion.div>

          {summary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center justify-center gap-12 mt-16 pt-16 border-t border-border/30"
            >
              {[
                { value: summary.totalProducts, ar: "منتج", en: "Products" },
                { value: summary.totalCategories, ar: "فئة", en: "Categories" },
                { value: summary.inStockCount, ar: "متاح", en: "In Stock" },
              ].map((stat, i) => (
                <div key={i} className="text-center" data-testid={`stat-${i}`}>
                  <p className="text-3xl font-bold text-primary">{stat.value}+</p>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-1">{t(stat.ar, stat.en)}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4 max-w-screen-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-4">{t("اختيارات مميزة", "Curated Picks")}</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-wider mb-4">{t("المجموعة المميزة", "Featured Collection")}</h2>
            <div className="gold-divider w-24 mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {featured?.slice(0, 4).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                data-testid={`featured-product-${product.id}`}
              >
                <Link href={`/products/${product.id}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-background border border-border mb-4">
                    <img
                      src={product.imageUrl}
                      alt={t(product.nameAr, product.nameEn)}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-75 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {product.badge && (
                      <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-[9px] tracking-widest uppercase px-3 py-1">
                        {product.badge}
                      </div>
                    )}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                      <span className="bg-primary text-primary-foreground text-[10px] tracking-widest uppercase px-6 py-2">
                        {t("تسوق الآن", "Shop Now")}
                      </span>
                    </div>
                  </div>
                  <p className="text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-1">
                    {t(product.categoryNameAr ?? "", product.categoryNameEn ?? "")}
                  </p>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors tracking-wide">
                    {t(product.nameAr, product.nameEn)}
                  </h3>
                  <p className="text-primary mt-1 font-bold">
                    {product.basePrice.toFixed(0)} {t("ر.س", "SAR")}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/products"
              className="inline-flex h-12 items-center gap-3 border border-border text-foreground px-10 text-xs tracking-widest uppercase hover:border-primary/50 transition-colors"
              data-testid="link-view-all"
            >
              {t("عرض الكل", "View All")}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-screen-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-4">{t("تسوق بالفئة", "Shop by Category")}</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-wider">{t("فئات المنتجات", "Product Categories")}</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories?.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/products?category=${cat.id}`}
                  className="group block bg-card border border-border p-6 text-center hover:border-primary/50 transition-all hover:bg-accent"
                  data-testid={`link-category-${cat.id}`}
                >
                  <div className="w-10 h-10 border border-primary/30 mx-auto mb-4 flex items-center justify-center group-hover:border-primary transition-colors">
                    <span className="text-primary text-xs font-bold">{cat.productCount}</span>
                  </div>
                  <p className="font-semibold text-sm tracking-wide">{t(cat.nameAr, cat.nameEn)}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{cat.productCount} {t("منتج", "products")}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-24 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-6">{t("قصتنا", "Our Story")}</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-wider mb-8 leading-tight">
                {t("ليس مجرد منتج —", "Not just a product —")}
                <br />
                <span className="gold-shimmer">{t("إرث يُفخر به", "A Legacy to Be Proud Of")}</span>
              </h2>
              <div className="gold-divider w-24 mb-8" />
              <p className="text-muted-foreground leading-relaxed mb-6">
                {t(
                  "الذهب الأسود ليست مجرد علامة تجارية — إنها رحلة شغف وإخلاص لأجود المنتجات الطبيعية. نختار بعناية كل منتج من مصادره الأصيلة لنوصل إليك أفضل ما أنتجته الطبيعة.",
                  "Black Gold is not just a brand — it is a journey of passion and dedication to the finest natural products. We carefully select each product from its authentic sources to bring you the best that nature has to offer."
                )}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-10">
                {t(
                  "من مزارع التمور في المدينة المنورة إلى مناحل العسل في اليمن وحقول الزيتون في الشام — كل منتج يحمل قصة أرض وإنسان.",
                  "From date farms in Madinah to honey apiaries in Yemen and olive groves in the Levant — every product carries a story of land and people."
                )}
              </p>
              <Link
                href="/products"
                className="inline-flex h-12 items-center gap-3 bg-primary text-primary-foreground px-8 text-xs tracking-widest uppercase hover:bg-primary/90 transition-colors"
                data-testid="link-discover"
              >
                {t("اكتشف المجموعة", "Discover the Collection")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { value: "١٥+", en: "15+", ar: "سنة خبرة", label_en: "Years Experience" },
                { value: "٥٠٠٠+", en: "5000+", ar: "عميل راضٍ", label_en: "Happy Clients" },
                { value: "١٠٠٪", en: "100%", ar: "طبيعي خالص", label_en: "Pure Natural" },
                { value: "٢٠+", en: "20+", ar: "دولة نصل إليها", label_en: "Countries Served" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-background border border-border p-8 text-center"
                >
                  <p className="text-3xl font-bold text-primary mb-2">{t(stat.value, stat.en)}</p>
                  <p className="text-[10px] tracking-widest uppercase text-muted-foreground">{t(stat.ar, stat.label_en)}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-screen-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, ar: "جودة مضمونة 100٪", en: "100% Quality Guaranteed", descAr: "كل منتج خضع لاختبارات صارمة", descEn: "Every product rigorously tested" },
              { icon: Truck, ar: "توصيل سريع", en: "Fast Delivery", descAr: "خلال 24-48 ساعة", descEn: "Within 24-48 hours" },
              { icon: Star, ar: "منتجات أصيلة", en: "Authentic Products", descAr: "من المصدر مباشرة", descEn: "Direct from the source" },
              { icon: Users, ar: "دعم متواصل", en: "Continuous Support", descAr: "فريقنا متاح على مدار الساعة", descEn: "Our team is available 24/7" },
            ].map(({ icon: Icon, ar, en, descAr, descEn }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center py-8 px-4"
              >
                <div className="w-12 h-12 border border-primary/30 mx-auto mb-4 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold tracking-wide mb-2">{t(ar, en)}</h3>
                <p className="text-xs text-muted-foreground">{t(descAr, descEn)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Wholesale CTA */}
      <section className="py-24 border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, hsl(45 93% 47%) 0%, transparent 70%)" }} />
        </div>
        <div className="container mx-auto px-4 max-w-screen-xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-6">{t("للتجار والموزعين", "For Merchants & Distributors")}</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-wider mb-6">
              {t("تاجر معنا — اربح مع الذهب الأسود", "Partner With Us — Profit With Black Gold")}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-10">
              {t(
                "نقدم أسعاراً تنافسية للكميات الكبيرة مع دعم متخصص لشركاء الأعمال",
                "We offer competitive pricing for large volumes with dedicated support for business partners"
              )}
            </p>
            <Link
              href="/wholesale"
              className="inline-flex h-14 items-center gap-3 bg-primary text-primary-foreground px-12 text-sm tracking-widest uppercase hover:bg-primary/90 transition-colors"
              data-testid="link-wholesale-cta"
            >
              {t("طلب أسعار الجملة", "Request Wholesale Pricing")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
