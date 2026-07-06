import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, User, Globe, Menu, X, Search, Sun, Moon, Leaf } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/use-auth";
import { useCartSession } from "@/hooks/use-cart-session";
import { useGetCart, getGetCartQueryKey, useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { Button } from "./ui/button";

const logoImg = "/brand/logo-transparent.png";

function useDebounce<T>(value: T, delay: number): T {
  const [dv, setDv] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDv(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return dv;
}

export function Navbar() {
  const { lang, setLang, t } = useLang();
  const { isAuthenticated } = useAuth();
  const sessionId = useCartSession();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [ecoMode, setEcoMode] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(searchQuery, 280);

  const { data: cart } = useGetCart(
    { sessionId },
    { query: { enabled: !!sessionId, queryKey: getGetCartQueryKey({ sessionId }) } }
  );

  const searchParams = { search: debouncedSearch || undefined };
  const { data: searchResults } = useListProducts(
    searchParams,
    { query: { enabled: debouncedSearch.length >= 2, queryKey: getListProductsQueryKey(searchParams) } }
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    if (!darkMode) {
      document.documentElement.style.setProperty("--background", "98% 0% 0deg");
      document.documentElement.style.setProperty("--foreground", "10% 0% 0deg");
      document.documentElement.style.setProperty("--card", "95% 0% 0deg");
    } else {
      document.documentElement.style.removeProperty("--background");
      document.documentElement.style.removeProperty("--foreground");
      document.documentElement.style.removeProperty("--card");
    }
  }, [darkMode]);

  useEffect(() => {
    const id = "eco-mode-style";
    let el = document.getElementById(id);
    if (ecoMode) {
      if (!el) {
        el = document.createElement("style");
        el.id = id;
        el.textContent = "img, video { display: none !important; }";
        document.head.appendChild(el);
      }
    } else {
      el?.remove();
    }
  }, [ecoMode]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 80);
  }, [searchOpen]);

  const navLinks = [
    { href: "/products", ar: "المنتجات", en: "Products" },
    { href: "/wholesale", ar: "الجملة", en: "Wholesale" },
  ];

  const showDropdown = searchOpen && debouncedSearch.length >= 2;

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-primary/20 bg-background/90 backdrop-blur-md"
      style={{ boxShadow: "0 1px 0 hsl(43 90% 50% / 0.12), 0 4px 24px hsl(0 0% 0% / 0.5)" }}
    >
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8 mx-auto gap-2">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0 mr-2" data-testid="link-logo">
          <motion.div whileHover={{ scale: 1.03 }} className="flex items-center gap-2">
            <img src={logoImg} alt="Black Gold Logo"
              className="h-10 w-auto object-contain drop-shadow-[0_0_6px_hsl(43_90%_50%/0.4)]"
              style={{ maxWidth: "44px" }} />
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-bold text-sm tracking-[0.25em] uppercase gold-shimmer">{t("الذهب الأسود", "BLACK GOLD")}</span>
              <span className="text-[8px] tracking-[0.2em] uppercase text-primary/50 mt-0.5">{t("فحم شيشة فاخر", "Premium Charcoal")}</span>
            </div>
          </motion.div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 flex-shrink-0">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className={`text-xs tracking-widest uppercase transition-colors hover:text-primary ${location === link.href ? "text-primary" : "text-primary/55"}`}>
              {t(link.ar, link.en)}
            </Link>
          ))}
        </nav>

        {/* Live Search */}
        <div ref={searchRef} className="relative flex-1 min-w-0 max-w-xs mx-auto">
          <AnimatePresence mode="wait">
            {searchOpen ? (
              <motion.div key="open"
                initial={{ opacity: 0, scaleX: 0.8 }} animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0.8 }} transition={{ duration: 0.18 }}
                className="flex items-center border border-primary/50 bg-background/95 origin-right"
              >
                <Search className="h-3.5 w-3.5 text-muted-foreground mx-3 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("ابحث عن منتج...", "Search products...")}
                  className="flex-1 h-9 min-w-0 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="p-2 text-muted-foreground hover:text-foreground flex-shrink-0">
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ) : (
              <motion.button key="closed"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 h-9 px-3 text-xs text-muted-foreground hover:text-primary border border-transparent hover:border-primary/30 transition-all w-full"
              >
                <Search className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="hidden md:inline tracking-widest truncate">{t("بحث في المنتجات...", "Search products...")}</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Results Dropdown */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-1 z-[100] bg-background border border-border shadow-[0_12px_40px_rgba(0,0,0,0.85)] max-h-72 overflow-y-auto"
              >
                {!searchResults || searchResults.length === 0 ? (
                  <p className="px-4 py-4 text-xs text-muted-foreground tracking-widest text-center">
                    {t("لا توجد نتائج", "No results found")}
                  </p>
                ) : (
                  <>
                    <p className="px-4 py-2 text-[9px] tracking-[0.25em] uppercase text-primary border-b border-border">
                      {searchResults.length} {t("نتيجة", "results")}
                    </p>
                    {searchResults.slice(0, 6).map((p) => (
                      <Link key={p.id} href={`/products/${p.id}`}
                        onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors border-b border-border/50 last:border-b-0"
                      >
                        <img src={p.imageUrl} alt="" className="h-10 w-10 object-cover flex-shrink-0 border border-border" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium line-clamp-1">{t(p.nameAr, p.nameEn)}</p>
                          <p className="text-[10px] text-primary mt-0.5">{p.basePrice.toFixed(0)} {t("ر.س", "SAR")}</p>
                        </div>
                      </Link>
                    ))}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0 flex-shrink-0">
          {/* Eco Mode */}
          <Button variant="ghost" size="icon"
            onClick={() => setEcoMode(!ecoMode)}
            title={t(ecoMode ? "إيقاف وضع الاقتصاد" : "وضع الاقتصاد (اتصال بطيء)", ecoMode ? "Disable Eco Mode" : "Eco Mode (slow connection)")}
            className={`h-9 w-9 transition-colors ${ecoMode ? "text-green-500 hover:text-green-400 bg-green-500/10" : "text-primary/40 hover:text-primary hover:bg-primary/8"}`}
            data-testid="button-toggle-eco"
          >
            <Leaf className="h-3.5 w-3.5" />
          </Button>

          {/* Dark / Light Mode */}
          <Button variant="ghost" size="icon"
            onClick={() => setDarkMode(!darkMode)}
            title={t(darkMode ? "الوضع الفاتح" : "الوضع الداكن", darkMode ? "Light Mode" : "Dark Mode")}
            className="h-9 w-9 text-primary/40 hover:text-primary hover:bg-primary/8"
            data-testid="button-toggle-dark"
          >
            {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>

          {/* Language */}
          <Button variant="ghost" size="sm"
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="h-9 px-2 text-xs tracking-widest uppercase text-primary/60 hover:text-primary hover:bg-primary/8"
            data-testid="button-toggle-language"
          >
            <Globe className="h-3.5 w-3.5 mr-1" />
            {lang === "ar" ? "EN" : "AR"}
          </Button>

          {/* Account */}
          <Button variant="ghost" size="icon"
            onClick={() => setLocation(isAuthenticated ? "/account/orders" : "/account/login")}
            className="h-9 w-9 text-primary/60 hover:text-primary hover:bg-primary/8"
            data-testid="button-account"
          >
            <User className="h-3.5 w-3.5" />
          </Button>

          {/* Cart */}
          <Button variant="ghost" size="icon"
            onClick={() => setLocation("/cart")}
            className="h-9 w-9 relative text-primary/60 hover:text-primary hover:bg-primary/8"
            data-testid="button-cart"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <AnimatePresence>
              {cart && cart.itemCount > 0 && (
                <motion.span key="badge" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                  className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground font-bold shadow-[0_0_6px_hsl(43_90%_50%/0.6)]"
                  data-testid="text-cart-count"
                >
                  {cart.itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </Button>

          {/* Mobile menu */}
          <Button variant="ghost" size="icon"
            className="h-9 w-9 md:hidden text-primary/60 hover:text-primary hover:bg-primary/8"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="container px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <button key={link.href}
                  onClick={() => { setLocation(link.href); setMobileOpen(false); }}
                  className="block w-full text-left px-4 py-3 text-xs tracking-widest uppercase text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
                >
                  {t(link.ar, link.en)}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
