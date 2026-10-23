"use client";

import { Bottle } from "@/components/product/Bottle";
import { brand } from "@/config/brand";
import { products } from "@/data/products";
import { cn } from "@/lib/cn";
import { ACCENT_STOPS, HOUSE_THEME } from "@/lib/theme/types";
import { useTheme } from "@/providers/ThemeProvider";

const pillClass =
  "inline-flex items-center rounded-full px-5 py-2.5 text-label uppercase transition-transform duration-300 ease-lux hover:-translate-y-0.5";

// Phase 1 placeholder: a preview of the theme engine and type scale, replaced from Phase 2.
export function ShellPreview() {
  const { base, setTheme, previewTheme } = useTheme();

  return (
    <>
      <section id="worlds" aria-labelledby="worlds-title" className="mx-auto max-w-7xl px-5 py-24 md:px-10 md:py-32">
        <p className="text-micro uppercase text-gold-400">Theme engine</p>
        <h2 id="worlds-title" className="mt-4 font-display text-h2 uppercase">
          One accent. <span className="font-editorial normal-case italic text-gold-metal">A whole world.</span>
        </h2>
        <p className="mt-6 max-w-xl text-body-lg text-ivory-muted">
          Hover or focus a fragrance to preview its world across the site. Choose one to keep it.
        </p>
        <button
          type="button"
          aria-pressed={base === HOUSE_THEME}
          onClick={() => setTheme(HOUSE_THEME)}
          className={cn(pillClass, "mt-8 border border-gold-600 text-gold-200")}
        >
          House gold
        </button>

        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {products.map((product) => {
            const selected = base === product.slug;
            return (
              <li
                key={product.slug}
                data-theme={product.slug}
                onMouseEnter={() => previewTheme(product.slug)}
                onMouseLeave={() => previewTheme(null)}
              >
                <article className="grid h-full grid-cols-[6rem_1fr] items-center gap-5 border border-accent-border bg-ink-900/80 p-5 sm:grid-cols-[8rem_1fr] md:gap-8 md:p-8">
                  <Bottle product={product} sizes="128px" className="drop-shadow-[0_0_2rem_var(--accent-soft)]" />
                  <div>
                    <p className="text-micro uppercase text-accent-ink">{brand.copy.inspiredBy} {product.inspiredBy}</p>
                    <h3 className="mt-3 font-display text-h3 uppercase">{product.name}</h3>
                    <p className="mt-2 font-editorial text-editorial italic text-ivory-muted">{product.tagline}</p>
                    <div aria-hidden className="mt-6 flex h-2.5 overflow-hidden rounded-full">
                      {ACCENT_STOPS.map((stop) => (
                        <span key={stop} className="flex-1" style={{ backgroundColor: `var(--accent-${stop})` }} />
                      ))}
                    </div>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setTheme(product.slug)}
                      onFocus={() => previewTheme(product.slug)}
                      onBlur={() => previewTheme(null)}
                      className={cn(pillClass, "mt-6 bg-accent text-on-accent")}
                    >
                      {selected ? "World active" : `Enter ${product.name}`}
                    </button>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="type-title" className="mx-auto max-w-7xl px-5 pb-32 md:px-10">
        <p className="text-micro uppercase text-gold-400">Type scale</p>
        <h2 id="type-title" className="sr-only">
          Type scale
        </h2>
        <div className="mt-8 space-y-10">
          <p className="font-display text-mega text-gold-metal">ZED</p>
          <p className="font-display text-display uppercase">Velvet</p>
          <p className="font-display text-h1 uppercase">Sovereign</p>
          <p className="font-display text-h2 uppercase">Dominator</p>
          <p className="font-display text-h3 uppercase">Signature Scents</p>
          <p className="font-editorial text-editorial italic text-ivory-muted">
            Red velvet after midnight; cold steel at nine.
          </p>
          <p className="max-w-2xl text-body-lg">
            Body large. Each world is generated from a single accent colour, with text tokens checked for
            AA contrast at build time.
          </p>
          <p className="max-w-2xl text-body text-ivory-muted">
            Body. Gold stays constant as the brand anchor; only the accents morph.
          </p>
          <p className="text-label uppercase text-gold-400">Label · Long Lasting</p>
          <p className="text-micro uppercase text-ivory-muted">Micro · Fragrances</p>
        </div>
      </section>
    </>
  );
}
