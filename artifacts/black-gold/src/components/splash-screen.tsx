import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const SPLASH_KEY = "bg-splash-v2";

export function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    try {
      return !sessionStorage.getItem(SPLASH_KEY);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!visible) return;
    try { sessionStorage.setItem(SPLASH_KEY, "1"); } catch {}
    const timer = setTimeout(() => setVisible(false), 2200);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: "#080808" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.82, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-center px-8"
          >
            {/* Glow ring */}
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse 50% 50% at 50% 50%, hsl(43 90% 50% / 0.12) 0%, transparent 70%)",
              }}
            />

            {/* Logo */}
            <motion.img
              src="/brand/logo-transparent.png"
              alt="Black Gold"
              className="h-24 w-24 mx-auto mb-6 object-contain"
              animate={{ filter: ["drop-shadow(0 0 8px hsl(43 90% 50% / 0.4))", "drop-shadow(0 0 24px hsl(43 90% 50% / 0.9))", "drop-shadow(0 0 8px hsl(43 90% 50% / 0.4))"] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Arabic name */}
            <motion.h1
              className="font-calligraphic text-6xl md:text-8xl leading-tight mb-3"
              style={{
                background: "linear-gradient(135deg, hsl(43 90% 35%) 0%, hsl(43 90% 60%) 40%, hsl(43 90% 75%) 55%, hsl(43 90% 55%) 70%, hsl(43 90% 40%) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              الذهب الأسود
            </motion.h1>

            {/* English subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-[10px] tracking-[0.5em] uppercase text-primary/55 mb-6"
            >
              BLACK GOLD — PREMIUM CHARCOAL
            </motion.p>

            {/* Divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 0.9, ease: "easeOut" }}
              className="gold-divider w-36 mx-auto"
            />

            {/* Loading dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex justify-center gap-1.5 mt-6"
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-primary/50 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.25 }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
