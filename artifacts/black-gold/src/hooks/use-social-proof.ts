import { useEffect, useRef } from "react";
import { useToast } from "./use-toast";
import { useLang } from "@/contexts/LanguageContext";

const AR_CITIES = ["صنعاء", "عدن", "تعز", "الحديدة", "إب", "ذمار", "مأرب", "حضرموت"];
const AR_PRODUCTS = ["فحم بلدي فاخر", "فحم أحجار", "طقم الجملة 500 جرام", "فحم الذهب الأسود", "عبوة 250 جرام"];
const EN_CITIES = ["Sana'a", "Aden", "Taiz", "Hodeidah", "Ibb", "Dhamar", "Marib", "Hadramout"];
const EN_PRODUCTS = ["Premium Local Charcoal", "Stone Charcoal", "500g Bulk Pack", "Black Gold Charcoal", "250g Pack"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function useSocialProof() {
  const { toast } = useToast();
  const { t } = useLang();
  const countRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const MAX_TOASTS = 4;

    const fire = () => {
      if (countRef.current >= MAX_TOASTS) return;
      countRef.current++;

      const cityIdx = randInt(0, AR_CITIES.length - 1);
      const productIdx = randInt(0, AR_PRODUCTS.length - 1);
      const arCity = AR_CITIES[cityIdx];
      const enCity = EN_CITIES[cityIdx];
      const arProduct = AR_PRODUCTS[productIdx];
      const enProduct = EN_PRODUCTS[productIdx];

      toast({
        title: t(`🛒 عميل من ${arCity}`, `🛒 Customer from ${enCity}`),
        description: t(`أتم شراء ${arProduct} للتو!`, `Just purchased ${enProduct}!`),
        duration: 4500,
      });

      if (countRef.current < MAX_TOASTS) {
        timerRef.current = setTimeout(fire, randInt(20000, 40000));
      }
    };

    timerRef.current = setTimeout(fire, randInt(10000, 16000));
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
}
