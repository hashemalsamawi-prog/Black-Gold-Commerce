import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useLoginCustomer } from "@workspace/api-client-react";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AccountLogin() {
  const { t } = useLang();
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const loginCustomer = useLoginCustomer();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginForm) => {
    loginCustomer.mutate(
      { data },
      {
        onSuccess: (session) => {
          login(session.token, session.customer);
          setLocation("/account/orders");
        },
        onError: () => {
          toast({ title: t("خطأ في تسجيل الدخول", "Login failed"), variant: "destructive" });
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
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-3">{t("مرحباً بك", "Welcome Back")}</p>
          <h1 className="text-3xl font-bold tracking-wider gold-shimmer">
            {t("تسجيل الدخول", "Sign In")}
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
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("البريد الإلكتروني", "Email")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" className="bg-background border-border h-12" data-testid="input-login-email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs tracking-widest uppercase text-muted-foreground">{t("كلمة المرور", "Password")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" className="bg-background border-border h-12" data-testid="input-login-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button
                type="submit"
                disabled={loginCustomer.isPending}
                className="w-full h-14 bg-primary text-primary-foreground text-sm tracking-widest uppercase"
                data-testid="button-login"
              >
                {loginCustomer.isPending ? t("جاري الدخول...", "Signing in...") : t("دخول", "Sign In")}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("ليس لديك حساب؟", "Don't have an account?")}{" "}
              <Link href="/account/register" className="text-primary hover:underline" data-testid="link-register">
                {t("إنشاء حساب", "Register")}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
