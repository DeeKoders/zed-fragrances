export type Level = 1 | 2 | 3 | 4 | 5;

export type TextureKind = "marble-veins" | "lightning" | "smoke" | "silk" | "none";

export type Mood = "warm" | "cold";

/** A product's colour world. `accent` is the only colour required; the theme engine derives the rest. */
export type ThemeSpec = {
  accent: string;
  accentAlt?: string;
  glow?: string;
  texture: TextureKind;
  mood: Mood;
};

/** Keys of the line icons used in feature strips. */
export type FeatureIcon =
  | "lotus"
  | "clock"
  | "diamond"
  | "leaves"
  | "crown"
  | "bottle"
  | "lion"
  | "shield"
  | "flame";

export type ProductSize = { ml: number; price: number; inStock: boolean };

export type Product = {
  slug: string;
  name: string;
  inspiredBy: string;
  tagline: string;
  /** 2–3 sentence mood description. */
  story: string;
  gender: "men" | "women" | "unisex";
  concentration: string;
  /** A price of 0 renders as "Price on request". */
  sizes: ProductSize[];
  notes: { top: string[]; heart: string[]; base: string[] };
  vibe: {
    longevity: Level;
    projection: Level;
    seasons: string[];
    occasions: string[];
    moodTags: string[];
  };
  features: { icon: FeatureIcon; label: string }[];
  /** Path to the emblem artwork (lotus, lion, ...). */
  emblem: string;
  /** Ingredient images for the parallax layers. */
  props: string[];
  images: {
    /** Transparent bottle cutout. */
    bottle: string;
    hero: string;
    poster?: string;
    gallery: string[];
    /** Alt text overrides; sensible defaults are generated from the product data. */
    alt?: { bottle?: string; hero?: string };
  };
  theme: ThemeSpec;
  seo?: { title?: string; description?: string };
};
