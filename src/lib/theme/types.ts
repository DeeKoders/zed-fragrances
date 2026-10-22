// Client-safe theme constants and types. Keep culori out of this file so it never reaches the browser bundle.
import type { Mood, TextureKind } from "@/types/product";

/** Theme id used when no product is active. Reserved: no product may use it as a slug. */
export const HOUSE_THEME = "house";

export const ACCENT_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
export type AccentStop = (typeof ACCENT_STOPS)[number];

/** Every generated accent token. Each one is registered with @property so theme changes interpolate. */
export const THEME_PROPERTIES = [
  "--accent",
  ...ACCENT_STOPS.map((stop) => `--accent-${stop}` as const),
  "--accent-alt",
  "--accent-glow",
  "--accent-ink",
  "--on-accent",
  "--accent-border",
] as const;
export type ThemeProperty = (typeof THEME_PROPERTIES)[number];

export type ThemeTokens = Record<ThemeProperty, string>;

/** What client code (provider, WebGL) needs to know about a theme. */
export type ThemeMeta = {
  id: string;
  name: string;
  accent: string;
  accentAlt: string;
  glow: string;
  texture: TextureKind;
  mood: Mood;
};
