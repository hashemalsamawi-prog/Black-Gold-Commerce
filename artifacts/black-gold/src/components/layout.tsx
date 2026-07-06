import { Navbar } from "./navbar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { useLang } from "@/contexts/LanguageContext";
import { siteConfig } from "@/data/config";
import { useSocialProof } from "@/hooks/use-social-proof";

const logoImg = "/brand/logo-transparent.png";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useLang();
  useSocialProof();

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      {/* Promo Bar */}
      <div className="bg-primary text-primary-foreground overflow-hidden py-2 relative z-50">
        <div className="marquee-track text-[9px] tracking-[0.2em] uppercase font-bold">
          {[1, 2].map((copy) => (
            <div key={copy} className="flex items-center gap-8 whitespace-nowrap px-10">
              <span>🚚 {t("توصيل مجاني لطلبات الجملة", "Free delivery on wholesale orders")}</span>
              <span className="opacity-40">◆</span>
              <span>👑 {t("جودة فحم محلية بمواصفات عالمية", "Local charcoal · world-class quality")}</span>
              <span className="opacity-40">◆</span>
              <span>🔥 {t("اشتعال فوري · بدون روائح", "Instant ignition · Odorless")}</span>
              <span className="opacity-40">◆</span>
              <span>📦 {t("توصيل خلال 24 ساعة", "Delivery within 24 hours")}</span>
              <span className="opacity-40">◆</span>
            </div>
          ))}
        </div>
      </div>
      <Navbar />
      <main className="flex-1">{children}</main>

      <footer className="border-t border-border py-16 mb-16 md:mb-0">
        <div className="container px-4 md:px-8 mx-auto max-w-screen-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src={logoImg} alt="Black Gold" className="h-12 w-12 object-contain" />
                <div>
                  <span className="text-lg font-bold tracking-[0.2em] uppercase gold-shimmer block leading-none">
                    {t(siteConfig.brand.nameAr, siteConfig.brand.nameEn)}
                  </span>
                  <span className="text-[9px] tracking-[0.15em] uppercase text-muted-foreground">
                    {t(siteConfig.brand.taglineAr, siteConfig.brand.taglineEn)}
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mb-5">
                {t(siteConfig.brand.descriptionAr, siteConfig.brand.descriptionEn)}
              </p>

              {/* App Store Buttons */}
              <div className="flex items-center gap-3 mb-5">
                <a href="#" aria-label="Google Play" className="flex items-center gap-2 border border-border px-3 py-2 hover:border-primary/60 transition-colors group">
                  <svg className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.65.18.96.04l.1-.06 11.03-6.37-2.4-2.4-9.69 8.79zm14.63-9.13-2.62-2.63 2.62-2.63 3.04 1.76c.87.5.87 1.66 0 2.16l-3.04 1.34zm-3.51-3.51L3.27.37C2.96.22 2.6.24 2.3.4L13.76 11.87l.54-.75zm-11.4-9.8-.08-.04c-.01 0-.01 0-.02-.01l-.01-.01c-.31-.14-.66-.12-.96.04v.01L1.22 1.32v.02c-.38.22-.64.63-.64 1.1v19.12c0 .47.26.88.64 1.1l.03.02 10.97-10.97L3.3 1.32l-.4-.0z"/></svg>
                  <div className="leading-none">
                    <p className="text-[8px] tracking-widest text-muted-foreground uppercase">{t("متاح على", "Get it on")}</p>
                    <p className="text-xs font-bold tracking-wide text-foreground">Google Play</p>
                  </div>
                </a>
                <a href="#" aria-label="App Store" className="flex items-center gap-2 border border-border px-3 py-2 hover:border-primary/60 transition-colors group">
                  <svg className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  <div className="leading-none">
                    <p className="text-[8px] tracking-widest text-muted-foreground uppercase">{t("حمّل من", "Download on the")}</p>
                    <p className="text-xs font-bold tracking-wide text-foreground">App Store</p>
                  </div>
                </a>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-3">
                <a
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center border border-primary/30 text-primary/60 hover:text-primary hover:border-primary transition-all duration-200 hover:shadow-[0_0_10px_hsl(43_90%_50%/0.3)]"
                  aria-label="Instagram"
                  data-testid="link-instagram"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
                <a
                  href={siteConfig.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center border border-primary/30 text-primary/60 hover:text-primary hover:border-primary transition-all duration-200 hover:shadow-[0_0_10px_hsl(43_90%_50%/0.3)]"
                  aria-label="Facebook"
                  data-testid="link-facebook"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>
                <a
                  href={`https://wa.me/${siteConfig.brand.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center border border-primary/30 text-primary/60 hover:text-primary hover:border-primary transition-all duration-200 hover:shadow-[0_0_10px_hsl(43_90%_50%/0.3)]"
                  aria-label="WhatsApp"
                  data-testid="link-whatsapp-social"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Shop links */}
            <div>
              <p className="text-xs tracking-widest uppercase text-primary mb-4">{t("تسوق", "Shop")}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="/products" className="hover:text-primary transition-colors">{t("جميع المنتجات", "All Products")}</a></li>
                <li><a href="/products?category=1" className="hover:text-primary transition-colors">{t("فحم بلدي", "Local Charcoal")}</a></li>
                <li><a href="/products?category=2" className="hover:text-primary transition-colors">{t("فحم فاخر", "Premium Charcoal")}</a></li>
                <li><a href="/wholesale" className="hover:text-primary transition-colors">{t("الجملة", "Wholesale")}</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs tracking-widest uppercase text-primary mb-4">{t("تواصل معنا", "Contact")}</p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <a href={`mailto:${siteConfig.brand.email}`} className="hover:text-primary transition-colors">
                    {siteConfig.brand.email}
                  </a>
                </li>
                <li>
                  <a href={`https://wa.me/${siteConfig.brand.whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                    className="hover:text-primary transition-colors">
                    {siteConfig.brand.whatsappDisplay}
                  </a>
                </li>
                <li><a href="/account/login" className="hover:text-primary transition-colors">{t("تسجيل الدخول", "Sign In")}</a></li>
                <li><a href="/account/orders" className="hover:text-primary transition-colors">{t("طلباتي", "My Orders")}</a></li>
              </ul>
            </div>
          </div>

          <div className="gold-divider mb-8" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-xs tracking-widest">
              © {new Date().getFullYear()} {t("الذهب الأسود. جميع الحقوق محفوظة.", "BLACK GOLD. ALL RIGHTS RESERVED.")}
            </p>
            <div className="flex items-center gap-4">
              <a href={`mailto:${siteConfig.brand.email}`}
                className="text-xs tracking-widest text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-email-footer">
                {siteConfig.brand.email}
              </a>
              <span className="hidden sm:block text-border">|</span>
              <a href={`https://wa.me/${siteConfig.brand.whatsappNumber}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
                data-testid="link-whatsapp-footer">
                {t("واتساب", "WhatsApp")}
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile bottom nav */}
      <MobileBottomNav />

      {/* Floating WhatsApp — premium charcoal + gold ring */}
      <a
        href={`https://wa.me/${siteConfig.brand.whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-6 right-6 z-50 group flex h-14 w-14 items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          background: "linear-gradient(135deg, #0e0e0e 0%, #1a1a1a 100%)",
          borderRadius: "50%",
          boxShadow: "0 0 0 1.5px hsl(43 90% 50% / 0.7), 0 0 18px hsl(43 90% 50% / 0.25), 0 4px 20px rgba(0,0,0,0.6)",
        }}
        data-testid="button-whatsapp"
        aria-label={t("تواصل معنا واتساب", "WhatsApp us")}
      >
        <svg className="h-6 w-6 transition-all duration-300 group-hover:scale-110"
          viewBox="0 0 24 24" style={{ fill: "hsl(43 90% 50%)" }}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
