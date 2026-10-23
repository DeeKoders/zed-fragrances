import type { FeatureIcon, ThemeSpec } from "./product";

export type ImageAsset = { src: string; width: number; height: number };

export type GoldStop = "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900";

export type Brand = {
  name: string;
  shortName: string;
  description: string;
  /** Canonical site URL, used for metadata, sitemap and OG images. */
  siteUrl: string;
  taglines: {
    primary: string;
    quality: string;
    drop: string;
    urgency: string;
  };
  logo: {
    /** The official logo file, untouched. */
    full: ImageAsset;
    /** Crop of the official logo (ZED + FRAGRANCES) with its black background turned to transparency. */
    wordmark: ImageAsset;
  };
  /** Constant colours. Gold is the brand anchor and never morphs. */
  palette: {
    ink: { "950": string; "900": string; "800": string; "700": string };
    line: string;
    ivory: string;
    ivoryMuted: string;
    gold: Record<GoldStop, string>;
  };
  /** The site's world when no product is active. */
  houseTheme: ThemeSpec;
  nav: { label: string; href: string }[];
  socials: { label: string; href: string }[];
  /** International format without "+", e.g. 923001234567. */
  whatsapp: string;
  currency: string;
  locale: string;
  dropBanner: {
    enabled: boolean;
    eyebrow: string;
    text: string;
    /** Optional stock meter. */
    stock: { remaining: number; total: number } | null;
    /** Optional countdown target, ISO 8601. */
    countdownTo: string | null;
    /** Mood image behind the banner (darkened), optional. */
    image: ImageAsset | null;
  };
  disclaimer: string;
  /** The brand-wide feature strip (4 items). Icons: see FeatureIcon in types/product.ts. */
  features: { icon: FeatureIcon; label: string }[];
  /** Interface copy, so components never hardcode words. */
  copy: {
    skipToContent: string;
    /** Prefix for a product's reference fragrance: "Inspired by Baccarat Rouge 540". */
    inspiredBy: string;
    hero: {
      /** Product call to action, followed by the product name: "Discover Sovereign". */
      cta: string;
      scroll: string;
      previous: string;
      next: string;
    };
    worlds: {
      /** Heading of the product chapters section (read by assistive tech). */
      title: string;
      /** Second call to action in a chapter. */
      order: string;
      notes: { title: string; top: string; heart: string; base: string };
      vibe: { longevity: string; projection: string; seasons: string; occasions: string };
    };
    /** Shown instead of a price while it is 0. */
    priceOnRequest: string;
    finder: {
      eyebrow: string;
      title: string;
      intro: string;
      start: string;
      step: string;
      of: string;
      back: string;
      restart: string;
      resultEyebrow: string;
      match: string;
    };
    collection: {
      eyebrow: string;
      title: string;
      compare: string;
      compareDone: string;
      compareHint: string;
      select: string;
      clear: string;
      inspiredBy: string;
      concentration: string;
      sizes: string;
    };
    drop: { cta: string; stock: string; endsIn: string; units: { days: string; hours: string; minutes: string; seconds: string } };
    reviews: { eyebrow: string; title: string };
    footer: {
      fragrances: string;
      connect: string;
      whatsapp: string;
      newsletter: {
        title: string;
        text: string;
        label: string;
        placeholder: string;
        submit: string;
        success: string;
        error: string;
      };
    };
    cart: {
      title: string;
      bag: string;
      items: string;
      empty: string;
      emptyCta: string;
      close: string;
      remove: string;
      increase: string;
      decrease: string;
      quantity: string;
      subtotal: string;
      onRequestNote: string;
      checkout: string;
      addToBag: string;
      outOfStock: string;
    };
    product: {
      size: string;
      gallery: string;
      openImage: string;
      zoom: string;
      close: string;
      previous: string;
      next: string;
      pairs: string;
      details: string;
    };
    /** Prefilled WhatsApp order message. */
    whatsapp: {
      greeting: string;
      total: string;
      onRequest: string;
      footer: string;
    };
    /** Labels the custom cursor shows over [data-cursor] elements. */
    cursor: { view: string; order: string };
  };
};
