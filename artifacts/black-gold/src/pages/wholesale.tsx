import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useLang } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { siteConfig } from "@/data/config";
import { MessageCircle, Package, Headphones, Truck } from "lucide-react";

const wholesaleSchema = z.object({
  contactName: z.string().min(2),
  phone: z.string().min(9),
  productInterest: z.string().min(3),
  estimatedQuantity: z.string().min(1),
  message: z.string().optional(),
});

type WholesaleForm = z.infer<typeof wholesaleSchema>;

const PRODUCTS = [
  { ar: "فحم بلدي 250 جرام", en: "Local Charcoal 250g" },
  { ar: "فحم بلدي 500 جرام", en: "Local Charcoal 500g" },
  { ar: "فحم فاخر 250 جرام", en: "Premium Charcoal 250g" },
  { ar: "فحم فاخر 500 جرام", en: "Premium Charcoal 500g" },
  { ar: "فحم أحجار 250 جرام", en: "Stone Charcoal 250g" },
  { ar: "فحم أحجار 500 جرام", en: "Stone Charcoal 500g" },
  { ar: "حزمة مشتركة", en: "Mixed Bundle" },
];

export default function Wholesale() {
  const { t } = useLang();

  const form = useForm<WholesaleForm>({
    resolver: zodResolver(wholesaleSchema),
    defaultValues: { contactName: "", phone: "", productInterest: "", estimatedQuantity: "", message: "" },
  });

  const onSubmit = (data: WholesaleForm) => {
    const msg = [
      `🏢 *طلب أسعار جملة — الذهب الأسود*`,
      `━━━━━━━━━━━━━━━━━`,
      `👤 *الاسم:* ${data.contactName}`,
      `📱 *الجوال:* ${data.phone}`,
      `━━━━━━━━━━━━━━━━━`,
      `📦 *المنتج المطلوب:* ${data.productInterest}`,
      `📊 *الكمية التقريبية:* ${data.estimatedQuantity}`,
      data.message ? `📝 *ملاحظات:* ${data.message}` : null,
      `━━━━━━━━━━━━━━━━━`,
      `✉️ ${siteConfig.brand.email}`,
    ].filter(Boolean).join("\n");

    window.open(`https://wa.me/${siteConfig.brand.whatsappNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const benefits = [
    { icon: Package, ar: "أسعار الجملة", en: "Wholesale Pricing", descAr: "أسعار تنافسية خاصة للكميات الكبيرة", descEn: "Competitive rates for large volumes" },
    { icon: Headphones, ar: "دعم مخصص", en: "Dedicated Support", descAr: "مدير حساب خاص لكل عميل", descEn: "Dedicated account manager" },
    { icon: Truck, ar: "توصيل أولوي", en: "Priority Delivery", descAr: "شحن سريع ومنتظم لطلباتك", descEn: "Fast and regular delivery" },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      {/* Header */}
      <div className="relative py-24 border-b border-border overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 70% 50%, hsl(43 90% 50%) 0%, transparent 60%)" }} />
        </div>
        <div className="container mx-auto px-4 max-w-screen-2xl relative z-10">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-[10px] tracking-[0.3em] uppercase text-primary mb-4">
            {t("شراكات الأعمال", "Business Partnerships")}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="font-calligraphic text-4xl md:text-6xl gold-shimmer max-w-2xl mb-6">
            {t("الذهب الأسود للجملة", "Black Gold Wholesale")}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-xl text-lg">
            {t(
              "هل أنت تاجر أو موزع؟ الأسعار متاحة فقط عبر واتساب للكميات الكبيرة.",
              "Are you a merchant or distributor? Prices available via WhatsApp for bulk orders only."
            )}
          </motion.p>

          {/* Quick WhatsApp CTA */}
          <motion.a
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            href={`https://wa.me/${siteConfig.brand.whatsappNumber}?text=${encodeURIComponent(t("مرحباً، أود الاستفسار عن أسعار الجملة — الذهب الأسود", "Hello, I'd like to inquire about wholesale prices — Black Gold"))}`}
            target="_blank" rel="noopener noreferrer"
            className="btn-gold-shimmer inline-flex items-center gap-3 mt-8 h-14 px-10 bg-primary text-primary-foreground text-sm tracking-widest uppercase hover:brightness-110 transition-all hover:shadow-[0_0_24px_hsl(43_90%_50%/0.45)]"
          >
            <MessageCircle className="h-5 w-5" />
            {t("استفسر عن أسعار الجملة", "Request Wholesale Prices")}
          </motion.a>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-screen-xl py-16">

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {benefits.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-border p-8 card-rim">
                <div className="w-10 h-10 border border-primary flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold tracking-wide mb-2">{t(item.ar, item.en)}</h3>
                <p className="text-muted-foreground text-sm">{t(item.descAr, item.descEn)}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Products — prices hidden */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mb-16">
          <h2 className="text-sm tracking-widest uppercase text-primary mb-8 pb-4 border-b border-border">
            {t("المنتجات المتاحة للجملة", "Products Available for Wholesale")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {PRODUCTS.map((p, i) => (
              <div key={i} className="bg-card border border-border p-5 text-center card-rim">
                <p className="text-sm font-medium text-foreground mb-2">{t(p.ar, p.en)}</p>
                <p className="text-xs tracking-widest text-primary">{t("السعر عند الطلب", "Price on request")}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quote Form */}
        <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="bg-card border border-border p-10 card-rim">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
              <h2 className="text-sm tracking-widest uppercase text-primary">
                {t("طلب عرض سعر", "Request a Quote")}
              </h2>
              <a href={`mailto:${siteConfig.brand.email}`}
                className="text-xs text-muted-foreground hover:text-primary transition-colors">
                {siteConfig.brand.email}
              </a>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="contactName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("الاسم *", "Name *")}</FormLabel>
                      <FormControl><Input {...field} className="bg-background border-border h-12" data-testid="input-contact-name" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("رقم الجوال *", "Phone *")}</FormLabel>
                      <FormControl><Input {...field} type="tel" className="bg-background border-border h-12" data-testid="input-wholesale-phone" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="productInterest" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("المنتج المطلوب *", "Product *")}</FormLabel>
                      <FormControl><Input {...field} placeholder={t("مثل: فحم بلدي 500 جرام", "e.g. Local Charcoal 500g")} className="bg-background border-border h-12" data-testid="input-product-interest" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="estimatedQuantity" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("الكمية التقريبية *", "Quantity *")}</FormLabel>
                      <FormControl><Input {...field} placeholder={t("مثل: 50 كيلو شهرياً", "e.g. 50 kg/month")} className="bg-background border-border h-12" data-testid="input-quantity" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="message" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("ملاحظات إضافية", "Additional Notes")}</FormLabel>
                    <FormControl><Textarea {...field} rows={3} className="bg-background border-border resize-none" data-testid="input-message" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit"
                  className="btn-gold-shimmer w-full h-14 bg-primary text-primary-foreground text-sm tracking-widest uppercase hover:brightness-110"
                  data-testid="button-submit-wholesale">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t("إرسال عبر واتساب", "Send via WhatsApp")}
                </Button>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
