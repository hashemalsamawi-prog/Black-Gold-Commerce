import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  useGetCart,
  getGetCartQueryKey,
  useCreateOrder,
} from "@workspace/api-client-react";
import { useLang } from "@/contexts/LanguageContext";
import { useCartSession } from "@/hooks/use-cart-session";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerEmail: z.string().email("Valid email required"),
  customerPhone: z.string().min(9, "Phone required"),
  deliveryAddress: z.string().min(5, "Address required"),
  city: z.string().min(2, "City required"),
  notes: z.string().optional(),
  paymentMethod: z.enum(["cash_on_delivery", "bank_transfer"]),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { t } = useLang();
  const sessionId = useCartSession();
  const [, setLocation] = useLocation();
  const { customer } = useAuth();

  const { data: cart, isLoading } = useGetCart(
    { sessionId },
    { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } }
  );

  const createOrder = useCreateOrder();

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: customer?.name ?? "",
      customerEmail: customer?.email ?? "",
      customerPhone: customer?.phone ?? "",
      deliveryAddress: "",
      city: customer?.city ?? "",
      notes: "",
      paymentMethod: "cash_on_delivery",
    },
  });

  const onSubmit = (data: CheckoutForm) => {
    createOrder.mutate(
      {
        data: {
          ...data,
          sessionId,
          customerId: customer?.id ?? null,
          notes: data.notes || null,
        },
      },
      {
        onSuccess: (order) => {
          setLocation(`/order-confirmation/${order.id}`);
        },
      }
    );
  };

  const subtotal = cart?.subtotal ?? 0;
  const deliveryFee = subtotal >= 500 ? 0 : 30;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 max-w-screen-xl py-16">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    setLocation("/cart");
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-border py-12">
        <div className="container mx-auto px-4 max-w-screen-xl">
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-2">{t("الخطوة الأخيرة", "Final Step")}</p>
          <h1 className="text-3xl font-bold tracking-wider">{t("إتمام الطلب", "Checkout")}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-screen-xl py-12">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 space-y-8"
              >
                {/* Customer Info */}
                <div className="bg-card border border-border p-8">
                  <h2 className="text-sm tracking-widest uppercase text-primary mb-6 pb-4 border-b border-border">
                    {t("بيانات العميل", "Customer Information")}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="customerName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("الاسم الكامل", "Full Name")}</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-background border-border h-12" data-testid="input-customer-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="customerPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("رقم الجوال", "Phone")}</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" className="bg-background border-border h-12" data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="customerEmail" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("البريد الإلكتروني", "Email")}</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" className="bg-background border-border h-12" data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Delivery */}
                <div className="bg-card border border-border p-8">
                  <h2 className="text-sm tracking-widest uppercase text-primary mb-6 pb-4 border-b border-border">
                    {t("عنوان التوصيل", "Delivery Address")}
                  </h2>
                  <div className="space-y-6">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("المدينة", "City")}</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-background border-border h-12" data-testid="input-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="deliveryAddress" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("العنوان التفصيلي", "Detailed Address")}</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-background border-border h-12" data-testid="input-address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("ملاحظات إضافية", "Additional Notes")}</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-background border-border h-12" data-testid="input-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-card border border-border p-8">
                  <h2 className="text-sm tracking-widest uppercase text-primary mb-6 pb-4 border-b border-border">
                    {t("طريقة الدفع", "Payment Method")}
                  </h2>
                  <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { value: "cash_on_delivery", ar: "الدفع عند الاستلام", en: "Cash on Delivery" },
                          { value: "bank_transfer", ar: "تحويل بنكي", en: "Bank Transfer" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => field.onChange(opt.value)}
                            className={`p-4 border text-sm text-left transition-all ${
                              field.value === opt.value
                                ? "border-primary text-primary bg-accent"
                                : "border-border text-muted-foreground hover:border-primary/50"
                            }`}
                            data-testid={`button-payment-${opt.value}`}
                          >
                            <span className="block font-medium tracking-wide">{t(opt.ar, opt.en)}</span>
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </motion.div>

              {/* Order Summary */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-1"
              >
                <div className="bg-card border border-border p-8 sticky top-24">
                  <h2 className="text-sm tracking-widest uppercase text-primary mb-6 pb-4 border-b border-border">
                    {t("ملخص الطلب", "Order Summary")}
                  </h2>
                  <div className="space-y-4 mb-6">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground truncate flex-1">
                          {t(item.productNameAr, item.productNameEn)} × {item.quantity}
                        </span>
                        <span className="ml-4 flex-shrink-0">{(item.price * item.quantity).toFixed(0)} {t("ر.س", "SAR")}</span>
                      </div>
                    ))}
                  </div>
                  <div className="gold-divider mb-4" />
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("المجموع الفرعي", "Subtotal")}</span>
                      <span>{subtotal.toFixed(0)} {t("ر.س", "SAR")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("التوصيل", "Delivery")}</span>
                      <span className="text-primary">{deliveryFee === 0 ? t("مجاني", "Free") : `${deliveryFee} ${t("ر.س", "SAR")}`}</span>
                    </div>
                  </div>
                  <div className="gold-divider mb-4" />
                  <div className="flex justify-between font-bold text-lg mb-8">
                    <span>{t("الإجمالي", "Total")}</span>
                    <span className="text-primary">{(subtotal + deliveryFee).toFixed(0)} {t("ر.س", "SAR")}</span>
                  </div>
                  <Button
                    type="submit"
                    disabled={createOrder.isPending}
                    className="w-full h-14 bg-primary text-primary-foreground text-sm tracking-widest uppercase"
                    data-testid="button-place-order"
                  >
                    {createOrder.isPending ? t("جاري معالجة الطلب...", "Processing...") : t("تأكيد الطلب", "Place Order")}
                  </Button>
                </div>
              </motion.div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
