import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Package, LogOut } from "lucide-react";
import { useGetCustomerOrders, getGetCustomerOrdersQueryKey } from "@workspace/api-client-react";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";

export default function AccountOrders() {
  const { t } = useLang();
  const { customer, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/account/login");
    }
  }, [isAuthenticated]);

  const { data: orders, isLoading } = useGetCustomerOrders(customer?.id ?? 0, {
    query: {
      enabled: !!customer?.id,
      queryKey: getGetCustomerOrdersQueryKey(customer?.id ?? 0),
    },
  });

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

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen">
      <div className="border-b border-border py-12">
        <div className="container mx-auto px-4 max-w-screen-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-2">{t("حسابي", "My Account")}</p>
            <h1 className="text-3xl font-bold tracking-wider">{t("طلباتي", "My Orders")}</h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => { logout(); setLocation("/"); }}
            className="text-muted-foreground hover:text-foreground gap-2"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            {t("خروج", "Sign Out")}
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-screen-xl py-12">
        {customer && (
          <div className="bg-card border border-border p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent border border-primary flex items-center justify-center">
                <span className="text-primary font-bold text-lg">{customer.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-medium">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : !orders || orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-30" />
            <h2 className="text-xl font-bold text-muted-foreground mb-4">
              {t("لا توجد طلبات بعد", "No orders yet")}
            </h2>
            <Link href="/products">
              <Button className="bg-primary text-primary-foreground h-12 px-8 tracking-widest uppercase" data-testid="button-shop-now">
                {t("تسوق الآن", "Shop Now")}
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                data-testid={`order-row-${order.id}`}
              >
                <div className="space-y-1">
                  <p className="font-medium tracking-wide">
                    {t(`طلب رقم #${order.id}`, `Order #${order.id}`)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString(t("ar-SA", "en-US"), {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.items.length} {t("عنصر", "items")}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <span
                    className={`text-xs tracking-widest uppercase px-3 py-1 border ${
                      order.status === "delivered"
                        ? "border-green-500/30 text-green-400"
                        : order.status === "cancelled"
                        ? "border-destructive/30 text-destructive"
                        : "border-primary/30 text-primary"
                    }`}
                    data-testid={`status-order-${order.id}`}
                  >
                    {statusLabel(order.status)}
                  </span>
                  <span className="font-bold text-primary" data-testid={`total-order-${order.id}`}>
                    {order.total.toFixed(0)} {t("ر.س", "SAR")}
                  </span>
                  <Link href={`/account/orders/${order.id}`} data-testid={`link-order-${order.id}`}>
                    <Button variant="ghost" size="sm" className="text-xs tracking-widest uppercase border border-border px-4 hover:border-primary/50">
                      {t("التفاصيل", "Details")}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
