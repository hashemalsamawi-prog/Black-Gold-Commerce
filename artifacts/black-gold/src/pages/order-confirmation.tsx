import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useGetOrder, getGetOrderQueryKey } from "@workspace/api-client-react";
import { useLang } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function OrderConfirmation() {
  const [, params] = useRoute("/order-confirmation/:id");
  const id = parseInt(params?.id ?? "0", 10);
  const { t } = useLang();

  const { data: order, isLoading } = useGetOrder(id, {
    query: { enabled: !!id, queryKey: getGetOrderQueryKey(id) },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 max-w-screen-lg py-16 text-center">
        <Skeleton className="h-16 w-16 rounded-full mx-auto mb-6" />
        <Skeleton className="h-8 w-64 mx-auto mb-4" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-16">
      <div className="container mx-auto px-4 max-w-screen-md text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="mb-8"
        >
          <CheckCircle className="h-20 w-20 text-primary mx-auto" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-4">
            {t("تم الطلب بنجاح", "Order Confirmed")}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-wider mb-4">
            {t("شكراً لك!", "Thank You!")}
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            {t("تم استلام طلبك بنجاح", "Your order has been received successfully")}
          </p>
          {order && (
            <p className="text-muted-foreground mb-8">
              {t(`رقم الطلب: #${order.id}`, `Order #${order.id}`)}
            </p>
          )}
        </motion.div>

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card border border-border p-8 text-left mb-8"
          >
            <h2 className="text-sm tracking-widest uppercase text-primary mb-6 pb-4 border-b border-border">
              {t("تفاصيل الطلب", "Order Details")}
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("الاسم", "Name")}</p>
                <p>{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("المدينة", "City")}</p>
                <p>{order.city}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("طريقة الدفع", "Payment")}</p>
                <p>{order.paymentMethod === "cash_on_delivery" ? t("الدفع عند الاستلام", "Cash on Delivery") : t("تحويل بنكي", "Bank Transfer")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{t("الحالة", "Status")}</p>
                <span className="text-primary text-xs tracking-widest uppercase">{t("قيد المعالجة", "Pending")}</span>
              </div>
            </div>

            <div className="gold-divider mb-4" />

            <div className="space-y-3 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t(item.productNameAr, item.productNameEn)} × {item.quantity}
                  </span>
                  <span>{(item.price * item.quantity).toFixed(0)} {t("ر.س", "SAR")}</span>
                </div>
              ))}
            </div>

            <div className="gold-divider mb-4" />

            <div className="flex justify-between font-bold">
              <span>{t("الإجمالي", "Total")}</span>
              <span className="text-primary">{order.total.toFixed(0)} {t("ر.س", "SAR")}</span>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-4 justify-center"
        >
          <Link href="/products">
            <Button className="bg-primary text-primary-foreground h-12 px-8 tracking-widest uppercase" data-testid="button-continue-shopping">
              {t("متابعة التسوق", "Continue Shopping")}
            </Button>
          </Link>
          <Link href="/account/orders">
            <Button variant="outline" className="h-12 px-8 tracking-widest uppercase border-border" data-testid="button-view-orders">
              {t("طلباتي", "My Orders")}
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
