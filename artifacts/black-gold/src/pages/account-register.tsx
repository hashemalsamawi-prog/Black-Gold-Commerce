import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useRegisterCustomer } from "@workspace/api-client-react";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(9),
  password: z.string().min(6),
  city: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function AccountRegister() {
  const { t } = useLang();
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const registerCustomer = useRegisterCustomer();
  const { toast } = useToast();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", city: "" },
  });

  const onSubmit = (data: RegisterForm) => {
    registerCustomer.mutate(
      { data: { ...data, city: data.city || null } },
      {
        onSuccess: (session) => {
          login(session.token, session.customer);
          setLocation("/account/orders");
        },
        onError: () => {
          toast({ title: t("خطأ في إنشاء الحساب", "Registration failed"), variant: "destructive" });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <div className="w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-3">{t("انضم إلينا", "Join Us")}</p>
          <h1 className="text-3xl font-bold tracking-wider gold-shimmer">
            {t("إنشاء حساب", "Create Account")}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border p-10"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("الاسم الكامل", "Full Name")}</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background border-border h-12" data-testid="input-reg-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("البريد الإلكتروني", "Email")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" className="bg-background border-border h-12" data-testid="input-reg-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("رقم الجوال", "Phone")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="tel" className="bg-background border-border h-12" data-testid="input-reg-phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="city" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("المدينة", "City")}</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-background border-border h-12" data-testid="input-reg-city" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("كلمة المرور", "Password")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" className="bg-background border-border h-12" data-testid="input-reg-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button
                type="submit"
                disabled={registerCustomer.isPending}
                className="w-full h-14 bg-primary text-primary-foreground text-sm tracking-widest uppercase"
                data-testid="button-register"
              >
                {registerCustomer.isPending ? t("جاري الإنشاء...", "Creating...") : t("إنشاء الحساب", "Create Account")}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("لديك حساب بالفعل؟", "Already have an account?")}{" "}
              <Link href="/account/login" className="text-primary hover:underline" data-testid="link-login">
                {t("تسجيل الدخول", "Sign In")}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
