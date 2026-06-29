import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetCart,
  getGetCartQueryKey,
  useCreateOrder,
} from "@workspace/api-client-react";
import { useLang } from "@/contexts/LanguageContext";
import { useCartSession } from "@/hooks/use-cart-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { siteConfig } from "@/data/config";
import { CheckCircle, Copy, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const EWALLET_IDS = siteConfig.ewallets.map((e) => e.id);

const checkoutSchema = z.object({
  customerName: z.string().min(2, "الاسم مطلوب"),
  customerPhone: z.string().min(9, "رقم الجوال مطلوب"),
  customerEmail: z.string().email("بريد إلكتروني غير صحيح").optional().or(z.literal("")),
  deliveryAddress: z.string().min(5, "العنوان مطلوب"),
  city: z.string().min(2, "المدينة مطلوبة"),
  notes: z.string().optional(),
  paymentMethod: z.enum(["cash_on_delivery", "bank_transfer"]),
  ewalletId: z.string().optional(),
  transferRef: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.paymentMethod === "bank_transfer" && !data.ewalletId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "اختر المحفظة الإلكترونية", path: ["ewalletId"] });
  }
  if (data.paymentMethod === "bank_transfer" && !data.transferRef?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "رقم العملية مطلوب", path: ["transferRef"] });
  }
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

function buildWhatsAppMessage(
  form: CheckoutForm,
  cartItems: Array<{ productNameAr: string; productNameEn: string; quantity: number; price: number }>,
  subtotal: number,
  deliveryFee: number,
  lang: "ar" | "en",
  t: (ar: string, en: string) => string,
): string {
  const ewallet = siteConfig.ewallets.find((e) => e.id === form.ewalletId);
  const total = subtotal + deliveryFee;

  const paymentLabel =
    form.paymentMethod === "cash_on_delivery"
      ? "الدفع عند الاستلام"
      : ewallet
      ? `${ewallet.nameAr} (محفظة إلكترونية)`
      : "تحويل إلكتروني";

  const itemLines = cartItems
    .map((i) => `  • ${i.productNameAr} × ${i.quantity} — ${(i.price * i.quantity).toFixed(0)} ر.س`)
    .join("\n");

  const lines = [
    `🌟 *طلب جديد — الذهب الأسود*`,
    `━━━━━━━━━━━━━━━━━`,
    `👤 *الاسم:* ${form.customerName}`,
    `📱 *الجوال:* ${form.customerPhone}`,
    form.customerEmail ? `📧 *الإيميل:* ${form.customerEmail}` : null,
    `📍 *المدينة:* ${form.city}`,
    `🏠 *العنوان:* ${form.deliveryAddress}`,
    `━━━━━━━━━━━━━━━━━`,
    `🛒 *المنتجات:*`,
    itemLines,
    `━━━━━━━━━━━━━━━━━`,
    `💰 *المجموع الفرعي:* ${subtotal.toFixed(0)} ر.س`,
    `🚚 *التوصيل:* ${deliveryFee === 0 ? "مجاني" : `${deliveryFee} ر.س`}`,
    `✅ *الإجمالي:* ${total.toFixed(0)} ر.س`,
    `━━━━━━━━━━━━━━━━━`,
    `💳 *طريقة الدفع:* ${paymentLabel}`,
    form.transferRef ? `🔑 *رقم العملية:* ${form.transferRef}` : null,
    form.notes ? `📝 *ملاحظات:* ${form.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return lines;
}

export default function Checkout() {
  const { t, lang } = useLang();
  const sessionId = useCartSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pendingFormData, setPendingFormData] = useState<CheckoutForm | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: cart, isLoading } = useGetCart(
    { sessionId },
    { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } }
  );

  const createOrder = useCreateOrder();

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      deliveryAddress: "",
      city: "",
      notes: "",
      paymentMethod: "cash_on_delivery",
      ewalletId: "",
      transferRef: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");
  const ewalletId = form.watch("ewalletId");
  const selectedEwallet = siteConfig.ewallets.find((e) => e.id === ewalletId);

  const subtotal = cart?.subtotal ?? 0;
  const deliveryFee = subtotal >= siteConfig.delivery.freeThreshold ? 0 : siteConfig.delivery.fee;

  const stopCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  const cancelSubmission = () => {
    stopCountdown();
    setCountdown(null);
    setPendingFormData(null);
  };

  const fireOrder = (data: CheckoutForm) => {
    const notesWithRef = [
      data.ewalletId ? `المحفظة: ${siteConfig.ewallets.find((e) => e.id === data.ewalletId)?.nameAr}` : null,
      data.transferRef ? `رقم العملية: ${data.transferRef}` : null,
      data.notes || null,
    ]
      .filter(Boolean)
      .join(" | ");

    createOrder.mutate(
      {
        data: {
          customerName: data.customerName,
          customerEmail: data.customerEmail || "guest@blackgold.sa",
          customerPhone: data.customerPhone,
          deliveryAddress: data.deliveryAddress,
          city: data.city,
          notes: notesWithRef || null,
          paymentMethod: data.paymentMethod,
          sessionId,
          customerId: null,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey({ sessionId }) });
          setSubmitted(true);
          const msg = buildWhatsAppMessage(data, cart?.items ?? [], subtotal, deliveryFee, lang, t);
          const url = `https://wa.me/${siteConfig.brand.whatsappNumber}?text=${encodeURIComponent(msg)}`;
          window.open(url, "_blank");
        },
        onError: () => {
          setCountdown(null);
          setPendingFormData(null);
          toast({ title: t("حدث خطأ", "Something went wrong"), variant: "destructive" });
        },
      }
    );
  };

  const onSubmit = (data: CheckoutForm) => {
    if (countdown !== null) return;
    setPendingFormData(data);
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      stopCountdown();
      setCountdown(null);
      if (pendingFormData) {
        fireOrder(pendingFormData);
      }
      return;
    }

    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c !== null ? c - 1 : null));
    }, 1000);

    return () => stopCountdown();
  }, [countdown]);

  useEffect(() => () => stopCountdown(), []);

  const copyAccountNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    toast({ title: t("تم النسخ", "Copied!") });
  };

  const isCountingDown = countdown !== null;
  const isProcessing = createOrder.isPending;
  const isButtonDisabled = isCountingDown || isProcessing;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 max-w-screen-xl py-16">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">{t("السلة فارغة", "Cart is empty")}</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
          <CheckCircle className="h-20 w-20 text-primary mx-auto" />
        </motion.div>
        <h1 className="text-2xl font-bold tracking-wider">{t("تم إرسال طلبك!", "Order Submitted!")}</h1>
        <p className="text-muted-foreground max-w-sm">
          {t("يتم تحويلك إلى واتساب لإرسال ملخص الطلب. شكراً لثقتك.", "Redirecting you to WhatsApp with your order summary. Thank you!")}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-0">
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
              {/* Left column */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 space-y-8">

                {/* Customer Info */}
                <div className="bg-card border border-border p-8">
                  <h2 className="text-sm tracking-widest uppercase text-primary mb-6 pb-4 border-b border-border">
                    {t("بيانات العميل", "Customer Information")}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="customerName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("الاسم الكامل *", "Full Name *")}</FormLabel>
                        <FormControl><Input {...field} className="bg-background border-border h-12" data-testid="input-customer-name" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="customerPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("رقم الجوال *", "Phone *")}</FormLabel>
                        <FormControl><Input {...field} type="tel" className="bg-background border-border h-12" data-testid="input-phone" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="customerEmail" render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("البريد الإلكتروني (اختياري)", "Email (optional)")}</FormLabel>
                        <FormControl><Input {...field} type="email" className="bg-background border-border h-12" data-testid="input-email" /></FormControl>
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
                        <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("المدينة *", "City *")}</FormLabel>
                        <FormControl><Input {...field} className="bg-background border-border h-12" data-testid="input-city" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="deliveryAddress" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("العنوان التفصيلي *", "Detailed Address *")}</FormLabel>
                        <FormControl><Input {...field} className="bg-background border-border h-12" data-testid="input-address" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="notes" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("ملاحظات إضافية", "Notes")}</FormLabel>
                        <FormControl><Input {...field} className="bg-background border-border h-12" data-testid="input-notes" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-card border border-border p-8">
                  <h2 className="text-sm tracking-widest uppercase text-primary mb-6 pb-4 border-b border-border">
                    {t("طريقة الدفع", "Payment Method")}
                  </h2>

                  <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {[
                          { value: "cash_on_delivery", ar: "💵 الدفع عند الاستلام", en: "💵 Cash on Delivery" },
                          { value: "bank_transfer", ar: "📱 محفظة إلكترونية", en: "📱 E-Wallet" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => { field.onChange(opt.value); form.setValue("ewalletId", ""); form.setValue("transferRef", ""); }}
                            className={`p-4 border text-sm text-right transition-all duration-200 ${field.value === opt.value ? "border-primary text-primary bg-accent gold-border-glow" : "border-border text-muted-foreground hover:border-primary/50"}`}
                            data-testid={`button-payment-${opt.value}`}
                          >
                            <span className="block font-medium tracking-wide">{t(opt.ar, opt.en)}</span>
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* E-Wallet section */}
                  <AnimatePresence>
                    {paymentMethod === "bank_transfer" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-6">
                          {/* Select wallet */}
                          <FormField control={form.control} name="ewalletId" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("اختر المحفظة *", "Select Wallet *")}</FormLabel>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                {siteConfig.ewallets.map((ew) => (
                                  <button
                                    key={ew.id}
                                    type="button"
                                    onClick={() => field.onChange(ew.id)}
                                    className={`p-3 border text-center text-sm transition-all duration-200 ${field.value === ew.id ? "border-primary text-primary bg-accent" : "border-border text-muted-foreground hover:border-primary/50"}`}
                                  >
                                    <span className="block font-medium">{t(ew.nameAr, ew.nameEn)}</span>
                                  </button>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )} />

                          {/* Account details */}
                          <AnimatePresence>
                            {selectedEwallet && (
                              <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                className="p-5 border border-primary/40 bg-accent/30"
                                style={{ boxShadow: "0 0 0 1px hsl(43 90% 50% / 0.15) inset" }}
                              >
                                <p className="text-xs tracking-widest uppercase text-primary mb-3">{t("بيانات التحويل", "Transfer Details")}</p>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm text-muted-foreground">{t("المحفظة:", "Wallet:")} <span className="text-foreground font-medium">{t(selectedEwallet.nameAr, selectedEwallet.nameEn)}</span></p>
                                    <p className="text-sm text-muted-foreground">{t("رقم الحساب:", "Account:")} <span className="text-primary font-bold text-base tracking-widest">{selectedEwallet.accountNumber}</span></p>
                                    <p className="text-sm text-muted-foreground">{t("الاسم:", "Name:")} <span className="text-foreground">{t(selectedEwallet.accountNameAr, selectedEwallet.accountNameEn)}</span></p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => copyAccountNumber(selectedEwallet.accountNumber)}
                                    className="p-2 border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                                    title={t("نسخ الرقم", "Copy number")}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Reference number */}
                          <FormField control={form.control} name="transferRef" render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">
                                {t("رقم العملية / السند *", "Transfer Reference Number *")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder={t("أدخل رقم العملية بعد إتمام التحويل", "Enter the reference number after transfer")}
                                  className="bg-background border-primary/40 h-12 focus:border-primary"
                                  data-testid="input-transfer-ref"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Order Summary */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-1">
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
                        <span className="ml-4 flex-shrink-0">{(item.price * item.quantity).toFixed(0)} {t(siteConfig.delivery.currencyAr, siteConfig.delivery.currencyEn)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="gold-divider mb-4" />
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("المجموع الفرعي", "Subtotal")}</span>
                      <span>{subtotal.toFixed(0)} {t(siteConfig.delivery.currencyAr, siteConfig.delivery.currencyEn)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t("التوصيل", "Delivery")}</span>
                      <span className="text-primary">{deliveryFee === 0 ? t("مجاني", "Free") : `${deliveryFee} ${t(siteConfig.delivery.currencyAr, siteConfig.delivery.currencyEn)}`}</span>
                    </div>
                  </div>
                  <div className="gold-divider mb-4" />
                  <div className="flex justify-between font-bold text-lg mb-6">
                    <span>{t("الإجمالي", "Total")}</span>
                    <span className="text-primary">{(subtotal + deliveryFee).toFixed(0)} {t(siteConfig.delivery.currencyAr, siteConfig.delivery.currencyEn)}</span>
                  </div>

                  {/* Countdown overlay */}
                  <AnimatePresence>
                    {isCountingDown && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="mb-4 p-4 border border-primary/40 bg-accent/30 text-center"
                      >
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {t("جاري تحويلك للواتساب...", "Redirecting to WhatsApp...")}
                          {" "}
                          <span className="text-primary font-bold text-xl tabular-nums">{countdown}</span>
                        </p>
                        <button
                          type="button"
                          onClick={cancelSubmission}
                          className="mt-3 flex items-center gap-2 mx-auto text-xs tracking-widest uppercase text-destructive border border-destructive/40 px-4 py-2 hover:bg-destructive/10 transition-colors"
                        >
                          <X className="h-3 w-3" />
                          {t("إلغاء", "Cancel")}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    disabled={isButtonDisabled}
                    className="btn-gold-shimmer w-full h-14 bg-primary text-primary-foreground text-sm tracking-widest uppercase hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                    data-testid="button-place-order"
                  >
                    {isProcessing
                      ? t("جاري الحفظ...", "Saving...")
                      : isCountingDown
                      ? t(`انتظر ${countdown} ث...`, `Wait ${countdown}s...`)
                      : t("تأكيد الطلب عبر واتساب ✓", "Confirm via WhatsApp ✓")}
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center mt-3 tracking-wide">
                    {t("سيتم تحويلك إلى واتساب لتأكيد الطلب", "You'll be redirected to WhatsApp to confirm")}
                  </p>
                </div>
              </motion.div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
