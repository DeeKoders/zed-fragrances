"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AddToBag } from "@/components/cart/AddToBag";
import { FloatingBottle } from "@/components/product/FloatingBottle";
import { IngredientLayers } from "@/components/product/IngredientLayers";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { NotesPyramid } from "@/components/product/NotesPyramid";
import { VibeMeters } from "@/components/product/VibeMeters";
import { FeatureIcon } from "@/components/ui/FeatureIcon";
import { brand } from "@/config/brand";
import { useAtmosphereCover } from "@/hooks/useAtmosphereCover";
import { usePointer } from "@/hooks/usePointer";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { buildOrder, checkout } from "@/lib/checkout";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { ease } from "@/lib/motion";
import { HOUSE_THEME } from "@/lib/theme/types";
import { useTheme } from "@/providers/ThemeProvider";
import { CollectionCard } from "@/sections/home/collection/CollectionCard";
import { WorldBackdrop } from "@/sections/home/hero/World";
import type { Product } from "@/types/product";
import { ProductGallery } from "./ProductGallery";
import { SizeSelector } from "./SizeSelector";

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: ease.lux },
});

/**
 * Product page body: the whole site takes this product's world while it's open. World hero with a
 * tilting bottle, size selector and ordering, notes and vibe, gallery, pairings, and a sticky
 * add-to-bag bar on phones once the main button scrolls away.
 */
export function ProductView({ product, pairs }: { product: Product; pairs: Product[] }) {
  const hero = useRef<HTMLElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const pointer = usePointer(hero);
  const reducedMotion = useReducedMotion();
  const { setTheme } = useTheme();
  const defaultSize = product.sizes.find((size) => size.inStock) ?? product.sizes[0];
  const [ml, setMl] = useState(defaultSize?.ml ?? 0);
  const [actionsVisible, setActionsVisible] = useState(true);
  const size = product.sizes.find((entry) => entry.ml === ml);
  const copy = brand.copy;
  useAtmosphereCover(hero);

  useEffect(() => {
    setTheme(product.slug);
    return () => setTheme(HOUSE_THEME);
  }, [product.slug, setTheme]);

  useEffect(() => {
    const element = actions.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setActionsVisible(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const buyNow = () => checkout(buildOrder([{ slug: product.slug, ml, quantity: 1 }]));

  return (
    <article data-theme={product.slug}>
      <section ref={hero} aria-labelledby="product-title" className="relative isolate overflow-hidden">
        <WorldBackdrop product={product} side="center" />
        <IngredientLayers product={product} className="opacity-60" />

        <div className="relative mx-auto grid min-h-svh max-w-7xl items-center gap-10 px-5 pb-16 pt-24 md:px-10 md:pt-28 lg:grid-cols-2">
          <motion.div {...rise(0)} className="flex justify-center">
            <FloatingBottle
              product={product}
              sizes="(min-width: 1024px) 24rem, 14rem"
              eager
              pointer={reducedMotion ? undefined : pointer}
              className="h-[50svh] lg:h-[min(72svh,46rem)]"
            />
          </motion.div>

          <div>
            <motion.p {...rise(0.1)} className="text-micro uppercase text-accent-ink">
              {copy.inspiredBy} {product.inspiredBy}
            </motion.p>
            <motion.h1 {...rise(0.15)} id="product-title" className="mt-4 font-display text-h1 uppercase lg:text-[clamp(3rem,6vw,6rem)]">
              <span className="text-accent-fill">{product.name}</span>
            </motion.h1>
            <motion.p {...rise(0.2)} className="mt-3 font-editorial text-editorial italic text-ivory">
              {product.tagline}
            </motion.p>
            <motion.p {...rise(0.25)} className="mt-6 max-w-lg text-body-lg text-ivory-muted">
              {product.story}
            </motion.p>

            <motion.div {...rise(0.3)}>
              <p className="mt-8 font-display text-h3 text-gold-200">{formatPrice(size?.price ?? 0)}</p>
              <p className="text-micro uppercase text-ivory-muted">
                {product.concentration} · {ml}ml
              </p>
              <SizeSelector name={`size-${product.slug}`} sizes={product.sizes} value={ml} onChange={setMl} />
              <div ref={actions} className="mt-8 flex flex-wrap gap-3">
                <AddToBag product={product} ml={ml} />
                <button
                  type="button"
                  data-cursor="order"
                  disabled={!size?.inStock}
                  onClick={buyNow}
                  className="sheen inline-flex items-center gap-3 border border-gold-600 px-5 py-3.5 text-label uppercase text-gold-200 transition-colors hover:border-gold-300 hover:text-gold-100 disabled:opacity-40"
                >
                  {copy.cart.checkout}
                </button>
              </div>
            </motion.div>

            <motion.ul {...rise(0.4)} className="mt-12 grid grid-cols-2 gap-y-6 border-t border-line pt-8 sm:grid-cols-4">
              {product.features.map((feature, index) => (
                <li
                  key={feature.label}
                  className={cn(
                    "flex flex-col items-center gap-3 px-2 text-center",
                    index > 0 && "sm:border-l sm:border-gold-700",
                    index % 2 === 1 && "border-l border-gold-700",
                  )}
                >
                  <FeatureIcon icon={feature.icon} className="size-9 text-gold-300" />
                  <span className="text-micro uppercase text-ivory-muted">{feature.label}</span>
                </li>
              ))}
            </motion.ul>
          </div>
        </div>
      </section>

      <section aria-labelledby={`${product.slug}-details`} className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
        <SplitHeading id={`${product.slug}-details`} text={copy.product.details} className="font-display text-h2 uppercase" />
        <div className="mt-10 grid gap-12 md:grid-cols-2">
          <NotesPyramid product={product} className="max-w-md" />
          <VibeMeters product={product} className="max-w-md" />
        </div>
      </section>

      <ProductGallery product={product} />

      {pairs.length > 0 && (
        <section aria-labelledby={`${product.slug}-pairs`} className="mx-auto max-w-7xl px-5 pb-28 md:px-10">
          <SplitHeading id={`${product.slug}-pairs`} text={copy.product.pairs} className="font-display text-h2 uppercase" />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pairs.map((pair) => (
              <li key={pair.slug}>
                <CollectionCard product={pair} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div
        inert={actionsVisible}
        className={cn(
          "fixed inset-x-0 bottom-0 z-[45] border-t border-line bg-ink-950/95 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 transition-transform duration-500 ease-lux md:hidden",
          actionsVisible ? "translate-y-full" : "translate-y-0",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-lg uppercase tracking-[0.08em]">{product.name}</p>
            <p className="text-micro uppercase text-ivory-muted">
              {ml}ml · {formatPrice(size?.price ?? 0)}
            </p>
          </div>
          <AddToBag product={product} ml={ml} className="shrink-0 px-4 py-3" />
        </div>
      </div>
    </article>
  );
}
