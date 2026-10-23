import type { Brand } from "@/types/brand";

const gold: Brand["palette"]["gold"] = {
  "100": "#F8E9B8",
  "200": "#EED48A",
  "300": "#E2BE62",
  "400": "#D4A848",
  "500": "#C5963A",
  "600": "#A6782A",
  "700": "#7F5A1E",
  "800": "#5A3F15",
  "900": "#33240C",
};

export const brand: Brand = {
  name: "ZED Fragrances",
  shortName: "ZED",
  description:
    "Luxury inspired-by perfumes with their own worlds. Sovereign and Dominator: signature scents for a distinctive you.",
  // Placeholder until the real domain is live.
  siteUrl: "https://zedfragrances.com",

  taglines: {
    primary: "Signature Scents. Distinctive You.",
    quality: "Premium Quality. Timeless Scents.",
    drop: "First Batch Ready",
    urgency: "Limited Stock. Grab Yours Before It Ends.",
  },

  logo: {
    full: { src: "/brand/zed-logo.png", width: 1254, height: 1254 },
    // Generated from zed-wordmark.png (black → transparent); identical to it on black.
    wordmark: { src: "/brand/zed-wordmark-alpha.png", width: 914, height: 445 },
  },

  palette: {
    ink: { "950": "#050505", "900": "#0B0A09", "800": "#14120F", "700": "#1F1B16" },
    line: "#2B261F",
    ivory: "#F2EAD8",
    ivoryMuted: "#B5AA95",
    gold,
  },

  houseTheme: { accent: gold["500"], texture: "smoke", mood: "warm" },

  nav: [
    { label: "Fragrances", href: "/#worlds" },
    { label: "Scent Finder", href: "/#finder" },
    { label: "Collection", href: "/#collection" },
  ],

  // Placeholders: replace with the real profiles.
  socials: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "TikTok", href: "https://tiktok.com/" },
    { label: "Facebook", href: "https://facebook.com/" },
  ],

  whatsapp: "923000000000",
  currency: "PKR",
  locale: "en-PK",

  dropBanner: {
    enabled: true,
    eyebrow: "First Batch Ready",
    text: "Limited Stock. Grab yours before it ends.",
    stock: null,
    countdownTo: null,
  },

  disclaimer:
    "ZED Fragrances is not affiliated with or endorsed by the brands referenced. Names are used for comparison only; all trademarks belong to their respective owners.",

  copy: {
    inspiredBy: "Inspired by",
    hero: {
      cta: "Discover",
      scroll: "Scroll",
      previous: "Previous fragrance",
      next: "Next fragrance",
    },
    cursor: { view: "View", order: "Order" },
  },
};
