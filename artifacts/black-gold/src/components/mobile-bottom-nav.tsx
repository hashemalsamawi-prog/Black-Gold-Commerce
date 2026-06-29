import { Link, useLocation } from "wouter";
import { Home, ShoppingBag, Users } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { useCartSession } from "@/hooks/use-cart-session";
import { useGetCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { AnimatePresence, motion } from "framer-motion";

export function MobileBottomNav() {
  const { t } = useLang();
  const [location] = useLocation();
  const sessionId = useCartSession();

  const { data: cart } = useGetCart(
    { sessionId },
    { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } }
  );

  const links = [
    { href: "/", icon: Home, ar: "الرئيسية", en: "Home" },
    { href: "/cart", icon: ShoppingBag, ar: "السلة", en: "Cart", badge: cart?.itemCount },
    { href: "/wholesale", icon: Users, ar: "الجملة", en: "Wholesale" },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-primary/20"
      style={{
        background: "linear-gradient(180deg, #0d0d0d 0%, #0a0a0a 100%)",
        boxShadow: "0 -1px 0 hsl(43 90% 50% / 0.18), 0 -4px 20px rgba(0,0,0,0.6)",
      }}
    >
      <div className="flex items-stretch h-16">
        {links.map((link) => {
          const Icon = link.icon;
          const active = link.href === "/" ? location === "/" : location.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 relative transition-all duration-200"
            >
              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-all duration-200 ${active ? "text-primary drop-shadow-[0_0_6px_hsl(43_90%_50%/0.8)]" : "text-primary/45"}`}
                />
                <AnimatePresence>
                  {link.badge && link.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground"
                    >
                      {link.badge}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span
                className={`text-[10px] tracking-widest uppercase transition-all duration-200 ${active ? "text-primary" : "text-primary/45"}`}
              >
                {t(link.ar, link.en)}
              </span>
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[2px] bg-primary"
                  style={{ boxShadow: "0 0 8px hsl(43 90% 50% / 0.8)" }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
