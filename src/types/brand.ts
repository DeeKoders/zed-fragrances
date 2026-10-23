import type { ThemeSpec } from "./product";

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
  };
  disclaimer: string;
  /** Interface copy, so components never hardcode words. */
  copy: {
    /** Prefix for a product's reference fragrance: "Inspired by Baccarat Rouge 540". */
    inspiredBy: string;
    hero: {
      /** Product call to action, followed by the product name: "Discover Sovereign". */
      cta: string;
      scroll: string;
      previous: string;
      next: string;
    };
    /** Labels the custom cursor shows over [data-cursor] elements. */
    cursor: { view: string; order: string };
  };
};
