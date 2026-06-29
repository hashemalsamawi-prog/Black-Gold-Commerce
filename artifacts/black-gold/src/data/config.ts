/**
 * CENTRALIZED SITE CONFIGURATION
 * Edit this file to update all content, prices, links, and account numbers
 * without touching any other frontend code.
 */

export const siteConfig = {
  brand: {
    nameAr: "الذهب الأسود",
    nameEn: "Black Gold",
    taglineAr: "فحم شيشة فاخر — جودة لا تضاهى",
    taglineEn: "Premium Hookah Charcoal — Unrivaled Quality",
    descriptionAr: "فحم شيشة فاخر بجودة لا مثيل لها. اشتعال سريع، احتراق طويل، وبدون روائح.",
    descriptionEn: "Premium hookah charcoal of unrivaled quality. Quick ignition, long burn, odorless.",
    email: "blackgold.ye@gmail.com",
    whatsappNumber: "966500000000",   // ← without + or spaces
    whatsappDisplay: "+966 500 000 000",
  },

  social: {
    instagram: "https://instagram.com/blackgold",   // ← update with real handle
    facebook: "https://facebook.com/blackgold",      // ← update with real page
  },

  seo: {
    title: "الذهب الأسود — فحم شيشة فاخر | Black Gold Premium Charcoal",
    descriptionAr: "فحم شيشة فاخر بجودة لا مثيل لها. اشتعال سريع، احتراق طويل، وبدون روائح. توصيل سريع.",
    descriptionEn: "Premium hookah charcoal. Quick ignition, long-lasting burn, odorless. Fast delivery.",
    ogImage: "/brand/logo-transparent.png",
    keywords: "فحم شيشة, فحم بلدي, فحم فاخر, Black Gold, hookah charcoal, شيشة",
  },

  delivery: {
    freeThreshold: 500,
    fee: 30,
    currencyAr: "ر.س",
    currencyEn: "SAR",
  },

  /**
   * E-WALLET PAYMENT METHODS
   * Add / remove entries here to control which wallets appear at checkout.
   * accountNumber and accountName are shown to the customer when they select this method.
   */
  ewallets: [
    {
      id: "flousak",
      nameAr: "فلوسك",
      nameEn: "Flousak",
      accountNumber: "XXXXXXXX",    // ← replace with real number
      accountNameAr: "الذهب الأسود",
      accountNameEn: "Black Gold",
    },
    {
      id: "jeeb",
      nameAr: "جيب",
      nameEn: "Jeeb",
      accountNumber: "XXXXXXXX",    // ← replace with real number
      accountNameAr: "الذهب الأسود",
      accountNameEn: "Black Gold",
    },
    {
      id: "jawali",
      nameAr: "جوالي",
      nameEn: "Jawali",
      accountNumber: "XXXXXXXX",    // ← replace with real number
      accountNameAr: "الذهب الأسود",
      accountNameEn: "Black Gold",
    },
    {
      id: "mobile_money",
      nameAr: "موبايل موني",
      nameEn: "Mobile Money",
      accountNumber: "XXXXXXXX",    // ← replace with real number
      accountNameAr: "الذهب الأسود",
      accountNameEn: "Black Gold",
    },
  ],
} as const;

export type EwalletId = typeof siteConfig.ewallets[number]["id"];
