import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useGetOrder, getGetOrderQueryKey, useCreateOrder } from "@workspace/api-client-react";
import { useLang } from "@/contexts/LanguageContext";
import { useCartSession } from "@/hooks/use-cart-session";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountOrderDetail() {
  const [, params] = useRoute("/account/orders/:id");
  const id = parseInt(params?.id ?? "0", 10);
  const { t } = useLang();

  const { data: order, isLoading } = useGetOrder(id, {
    query: { enabled: !!id, queryKey: getGetOrderQueryKey(id) },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 max-w-screen-lg py-16">
        <Skeleton className="h-8 w-48 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) return (
    <div className="container mx-auto px-4 py-16 text-center">
      <p className="text-muted-foreground">{t("الطلب غير موجود", "Order not found")}</p>
    </div>
  );

  const statusLabel = (status: string) => {
    const map: Record<string, { ar: string; en: string }> = {
      pending: { ar: "قيد المعالجة", en: "Pending" },
      confirmed: { ar: "مؤكد", en: "Confirmed" },
      shipped: { ar: "تم الشحن", en: "Shipped" },
      delivered: { ar: "تم التوصيل", en: "Delivered" },
      cancelled: { ar: "ملغي", en: "Cancelled" },
    };
    return t(map[status]?.ar ?? status, map[status]?.en ?? status);
  };

  return (
    <div className="min-h-screen">
      <div className="border-b border-border py-12">
        <div className="container mx-auto px-4 max-w-screen-lg">
          <Link href="/account/orders" className="flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors mb-4">
            <ArrowLeft className="h-3 w-3" />
            {t("العودة للطلبات", "Back to Orders")}
          </Link>
          <h1 className="text-2xl font-bold tracking-wider">
            {t(`طلب رقم #${order.id}`, `Order #${order.id}`)}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-screen-lg py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-card border border-border p-8"
          >
            <h2 className="text-sm tracking-widest uppercase text-primary mb-6 pb-4 border-b border-border">
              {t("عناصر الطلب", "Order Items")}
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">{t(item.productNameAr, item.productNameEn)}</p>
                    <p className="text-xs text-muted-foreground">{t(item.variantNameAr, item.variantNameEn)} × {item.quantity}</p>
                  </div>
                  <span className="text-primary font-bold">{(item.price * item.quantity).toFixed(0)} {t("ر.س", "SAR")}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("المجموع الفرعي", "Subtotal")}</span>
                <span>{order.subtotal.toFixed(0)} {t("ر.س", "SAR")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("التوصيل", "Delivery")}</span>
                <span>{order.deliveryFee === 0 ? t("مجاني", "Free") : `${order.deliveryFee.toFixed(0)} ${t("ر.س", "SAR")}`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span>{t("الإجمالي", "Total")}</span>
                <span className="text-primary">{order.total.toFixed(0)} {t("ر.س", "SAR")}</span>
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="bg-card border border-border p-6">
              <h3 className="text-xs tracking-widest uppercase text-primary mb-4">{t("حالة الطلب", "Status")}</h3>
              <span className="text-xs tracking-widest uppercase text-primary border border-primary/30 px-3 py-1">
                {statusLabel(order.status)}
              </span>
            </div>
            <div className="bg-card border border-border p-6">
              <h3 className="text-xs tracking-widest uppercase text-primary mb-4">{t("بيانات العميل", "Customer")}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{order.customerName}</p>
                <p>{order.customerEmail}</p>
                <p>{order.customerPhone}</p>
              </div>
            </div>
            <div className="bg-card border border-border p-6">
              <h3 className="text-xs tracking-widest uppercase text-primary mb-4">{t("التوصيل", "Delivery")}</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{order.city}</p>
                <p>{order.deliveryAddress}</p>
                {order.notes && <p className="text-xs mt-2 italic">{order.notes}</p>}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
