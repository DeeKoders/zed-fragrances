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

  whatsapp: "923127373848",
  currency: "PKR",
  locale: "en-PK",

  dropBanner: {
    enabled: true,
    eyebrow: "First Batch Ready",
    text: "Limited Stock. Grab yours before it ends.",
    stock: null,
    countdownTo: null,
    // Mood only: its labels contain text errors, so never use it for bottle close-ups.
    image: { src: "/images/reference/first-batch-poster.png", width: 1024, height: 1536 },
  },

  disclaimer:
    "ZED Fragrances is not affiliated with or endorsed by the brands referenced. Names are used for comparison only; all trademarks belong to their respective owners.",

  features: [
    { icon: "lotus", label: "Luxury Scent" },
    { icon: "clock", label: "Long Lasting" },
    { icon: "diamond", label: "Premium Quality" },
    { icon: "leaves", label: "Rich & Captivating" },
  ],

  copy: {
    skipToContent: "Skip to content",
    nav: { main: "Main", mobile: "Mobile", menu: "Menu", close: "Close", home: "ZED Fragrances home" },
    inspiredBy: "Inspired by",
    hero: {
      cta: "Discover",
      scroll: "Scroll",
      previous: "Previous fragrance",
      next: "Next fragrance",
    },
    worlds: {
      title: "The Worlds",
      order: "Order Now",
      notes: { title: "Notes", top: "Top", heart: "Heart", base: "Base" },
      vibe: { longevity: "Longevity", projection: "Projection", seasons: "Seasons", occasions: "Occasions" },
    },
    priceOnRequest: "Price on request",
    finder: {
      eyebrow: "Scent Finder",
      title: "Find your world",
      intro: "Four quick choices. We'll match you to the scent that feels like you.",
      start: "Begin",
      step: "Step",
      of: "of",
      back: "Back",
      restart: "Start again",
      resultEyebrow: "Your signature",
      match: "match",
    },
    collection: {
      eyebrow: "The Collection",
      title: "Every world, side by side",
      compare: "Compare",
      compareDone: "Done comparing",
      compareHint: "Pick up to three fragrances to compare.",
      select: "Add to compare",
      clear: "Clear",
      inspiredBy: "Inspired by",
      concentration: "Concentration",
      sizes: "Sizes",
    },
    drop: {
      cta: "Shop the first batch",
      stock: "left",
      endsIn: "Ends in",
      units: { days: "Days", hours: "Hrs", minutes: "Min", seconds: "Sec" },
    },
    reviews: { eyebrow: "Reviews", title: "Worn and loved" },
    footer: {
      fragrances: "Fragrances",
      connect: "Connect",
      whatsapp: "WhatsApp",
      newsletter: {
        title: "The inner circle",
        text: "New drops and restocks, first.",
        label: "Email address",
        placeholder: "you@example.com",
        submit: "Join",
        success: "You're on the list.",
        error: "Something went wrong. Please try again.",
      },
    },
    cart: {
      title: "Your bag",
      bag: "Bag",
      items: "items",
      empty: "Your bag is empty.",
      emptyCta: "Explore the collection",
      close: "Close bag",
      remove: "Remove",
      increase: "Increase quantity",
      decrease: "Decrease quantity",
      quantity: "Quantity",
      subtotal: "Subtotal",
      onRequestNote: "Some prices are on request; we'll confirm them on WhatsApp.",
      checkout: "Order on WhatsApp",
      addToBag: "Add to bag",
      outOfStock: "Sold out",
    },
    product: {
      size: "Size",
      gallery: "Gallery",
      openImage: "Open image",
      zoom: "Zoom",
      close: "Close",
      previous: "Previous image",
      next: "Next image",
      pairs: "Pairs well with",
      details: "The scent",
    },
    whatsapp: {
      greeting: "Hello ZED Fragrances! I'd like to order:",
      total: "Total",
      onRequest: "price on request",
      footer: "Name:\nCity:\nAddress:",
    },
    cursor: { view: "View", order: "Order" },
  },
};
