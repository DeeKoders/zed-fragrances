// Server-only: builds the theme stylesheet the root layout inlines. Runs at build time, so any
// invalid colour, duplicate slug or failed contrast check fails `npm run build`.
import { brand } from "@/config/brand";
import { products } from "@/data/products";
import { duration, easeCss } from "@/lib/motion";
import type { ThemeSpec } from "@/types/product";
import { assertContrast } from "./contrast";
import { createThemeTokens, type ThemeBase } from "./tokens";
import { HOUSE_THEME, THEME_PROPERTIES, type ThemeMeta } from "./types";

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type ThemeRegistry = { css: string; themes: ThemeMeta[] };

let cache: ThemeRegistry | undefined;

function declarations(vars: Record<string, string>) {
  return Object.entries(vars)
    .map(([name, value]) => `${name}:${value}`)
    .join(";");
}

function paletteVars() {
  const { ink, line, ivory, ivoryMuted, gold } = brand.palette;
  return {
    ...Object.fromEntries(Object.entries(ink).map(([stop, value]) => [`--ink-${stop}`, value])),
    "--line": line,
    "--ivory": ivory,
    "--ivory-muted": ivoryMuted,
    ...Object.fromEntries(Object.entries(gold).map(([stop, value]) => [`--gold-${stop}`, value])),
  };
}

function checkPalette() {
  const { ink, ivory, ivoryMuted, gold } = brand.palette;
  assertContrast(ivory, ink["700"], "palette ivory");
  assertContrast(ivoryMuted, ink["700"], "palette ivoryMuted");
  assertContrast(gold["400"], ink["700"], "palette gold-400");
}

export function getThemeRegistry(): ThemeRegistry {
  if (cache) return cache;

  checkPalette();

  const { palette } = brand;
  const base: ThemeBase = {
    surface: palette.ink["700"],
    ivory: palette.ivory,
    ink: palette.ink["950"],
    gold: palette.gold["600"],
  };

  const entries: { id: string; name: string; spec: ThemeSpec }[] = [
    { id: HOUSE_THEME, name: brand.name, spec: brand.houseTheme },
    ...products.map((product) => ({ id: product.slug, name: product.name, spec: product.theme })),
  ];

  const seen = new Set<string>();
  for (const { id } of entries) {
    if (!SLUG.test(id)) throw new Error(`[theme] "${id}" is not a valid slug (lowercase letters, digits, dashes).`);
    if (seen.has(id)) {
      throw new Error(`[theme] Duplicate theme id "${id}". Product slugs must be unique and "${HOUSE_THEME}" is reserved.`);
    }
    seen.add(id);
  }

  const themed = entries.map((entry) => ({ ...entry, tokens: createThemeTokens(entry.spec, base, entry.name) }));
  const house = themed[0].tokens;

  const css = [
    ...THEME_PROPERTIES.map((name) => `@property ${name}{syntax:"<color>";inherits:true;initial-value:black}`),
    `:root{${declarations(paletteVars())};${declarations(house)}}`,
    // Theme changes swap [data-theme] on <html>; the registered properties then interpolate (in Oklab).
    // Reduced motion is handled globally in globals.css.
    `:root{transition-property:${THEME_PROPERTIES.join(",")};transition-duration:${duration.theme * 1000}ms;transition-timing-function:${easeCss.silk}}`,
    ...themed.map(({ id, tokens }) => `[data-theme="${id}"]{${declarations(tokens)}}`),
  ].join("\n");

  cache = {
    css,
    themes: themed.map(({ id, name, spec, tokens }) => ({
      id,
      name,
      accent: tokens["--accent"],
      accentAlt: tokens["--accent-alt"],
      glow: tokens["--accent-glow"],
      texture: spec.texture,
      mood: spec.mood,
    })),
  };
  return cache;
}
