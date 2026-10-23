"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { FloatingBottle } from "@/components/product/FloatingBottle";
import { IngredientLayers } from "@/components/product/IngredientLayers";
import { NotesPyramid } from "@/components/product/NotesPyramid";
import { VibeMeters } from "@/components/product/VibeMeters";
import { brand } from "@/config/brand";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { productHref } from "@/lib/routes";
import { useTheme } from "@/providers/ThemeProvider";
import type { Product } from "@/types/product";
import { WorldBackdrop } from "../hero/World";
import { ChapterOrder } from "./ChapterOrder";

const pad = (value: number) => String(value).padStart(2, "0");

/** Parallax travel per depth layer, % of the stage. */
const LAYER_TRAVEL = [8, 18, 32];

type ChapterProps = { product: Product; index: number; total: number };

/**
 * A product chapter, pinned for a stretch of scroll: the name fills from outline to colour, the
 * bottle turns at centre stage, ingredients drift in depth, then the notes pyramid, vibe meters and
 * calls to action arrive. Desktop shows story and panel side by side; smaller screens swap the
 * story for the panel while the bottle lifts. Reduced motion: no pin or scrub, panel in flow.
 */
export function Chapter({ product, index, total }: ChapterProps) {
  const article = useRef<HTMLElement>(null);
  const { setTheme } = useTheme();
  const titleId = `chapter-${product.slug}`;

  useEffect(() => {
    const root = article.current;
    if (!root) return;
    const select = gsap.utils.selector(root);
    const media = gsap.matchMedia();

    media.add(
      { motion: "(prefers-reduced-motion: no-preference)", large: "(min-width: 1024px)" },
      (context) => {
        const { motion, large } = context.conditions as { motion: boolean; large: boolean };
        if (!motion) return;

        gsap.set(select("[data-chapter-bottle]"), { transformPerspective: 1200 });
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: select("[data-chapter-stage]")[0],
            start: "top top",
            end: () => `+=${window.innerHeight * (large ? 2.2 : 2.4)}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        timeline
          .fromTo(select("[data-name-window]"), { xPercent: -101 }, { xPercent: 0, duration: 0.4 }, 0)
          .fromTo(select("[data-name-fill]"), { xPercent: 101 }, { xPercent: 0, duration: 0.4 }, 0)
          .fromTo(select("[data-name-drift]"), { xPercent: 4 }, { xPercent: -4, duration: 1 }, 0)
          .fromTo(
            select("[data-chapter-bottle]"),
            { rotationY: -35, scale: 0.78, yPercent: 8 },
            { rotationY: 0, scale: 1, yPercent: 0, duration: 0.5, ease: "power2.out" },
            0,
          )
          .to(select("[data-chapter-bottle]"), { rotationY: 18, scale: 0.94, yPercent: -3, duration: 0.5, ease: "power1.in" }, 0.5)
          .fromTo(
            select("[data-chapter-meta]"),
            { yPercent: 40, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.15, stagger: 0.04, ease: "power2.out" },
            0.04,
          );

        LAYER_TRAVEL.forEach((travel, depth) => {
          timeline.fromTo(
            select(`[data-prop-layer="${depth}"]`),
            { yPercent: travel },
            { yPercent: -travel, duration: 1 },
            0,
          );
        });

        // Smaller screens: the story makes way for the panel and the bottle lifts out of its way.
        const panelAt = large ? 0.36 : 0.5;
        if (!large) {
          timeline
            .to(select("[data-chapter-story]"), { opacity: 0, yPercent: -30, duration: 0.08 }, 0.42)
            .to(select("[data-chapter-lift]"), { yPercent: -62, scale: 0.55, duration: 0.14, ease: "power2.inOut" }, 0.42)
            .to(select("[data-chapter-name]"), { opacity: 0.25, duration: 0.1 }, 0.42);
        }

        timeline
          .fromTo(
            select("[data-chapter-panel]"),
            { yPercent: 12, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.1, ease: "power2.out" },
            panelAt,
          )
          .fromTo(
            select("[data-tier]"),
            { yPercent: 40, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.08, stagger: 0.06, ease: "power2.out" },
            panelAt + 0.06,
          )
          .fromTo(
            select("[data-meter-fill]"),
            { scaleX: 0 },
            { scaleX: 1, duration: 0.05, stagger: 0.015, ease: "power1.out" },
            panelAt + 0.26,
          )
          .fromTo(
            select("[data-chapter-cta]"),
            { yPercent: 40, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.08, stagger: 0.04, ease: "power2.out" },
            panelAt + 0.38,
          );
      },
      root,
    );

    // The theme follows whichever chapter holds the middle of the screen (with or without motion).
    const theme = ScrollTrigger.create({
      trigger: root,
      start: "top 55%",
      end: "bottom 45%",
      onToggle: (self) => {
        if (self.isActive) setTheme(product.slug);
      },
    });

    return () => {
      theme.kill();
      media.revert();
    };
  }, [product.slug, setTheme]);

  return (
    <article ref={article} data-theme={product.slug} aria-labelledby={titleId} className="relative">
      <div
        data-chapter-stage
        className="relative h-svh min-h-[40rem] overflow-hidden bg-ink-950 motion-reduce:h-auto motion-reduce:overflow-visible"
      >
        <WorldBackdrop product={product} side="center" />

        <div className="relative h-svh min-h-[40rem]">
          <IngredientLayers product={product} />

          <h3
            id={titleId}
            data-chapter-name
            className="pointer-events-none absolute inset-x-0 top-[22%] z-[1] text-center font-display text-[13vw] uppercase leading-none tracking-[0.04em] lg:top-1/2 lg:-translate-y-1/2 lg:text-display"
          >
            <span data-name-drift className="relative inline-block">
              <span className="text-outline">{product.name}</span>
              <span data-name-window aria-hidden className="absolute inset-0 overflow-hidden">
                <span data-name-fill className="block text-accent-fill">
                  {product.name}
                </span>
              </span>
            </span>
          </h3>

          <div className="absolute left-1/2 top-[58%] z-[2] -translate-1/2 lg:top-1/2">
            <div data-chapter-lift>
              <div data-chapter-bottle>
                <Link href={productHref(product.slug)} tabIndex={-1} aria-hidden data-cursor="view" className="block">
                  <FloatingBottle
                    product={product}
                    sizes="(min-width: 1024px) 22rem, 12rem"
                    floatDelay={index * -2}
                    className="h-[42svh] lg:h-[min(64svh,44rem)]"
                  />
                </Link>
              </div>
            </div>
          </div>

          <div className="pointer-events-none relative z-[3] mx-auto flex h-full max-w-7xl flex-col justify-between px-5 pb-8 pt-20 md:px-10 md:pb-12 md:pt-28">
            <div className="flex items-start justify-between gap-6 text-micro uppercase">
              <p data-chapter-meta className="tabular-nums text-gold-400">
                {pad(index + 1)} / {pad(total)}
              </p>
              <p data-chapter-meta className="text-right text-accent-ink">
                {brand.copy.inspiredBy} {product.inspiredBy}
              </p>
            </div>
            <div data-chapter-story>
              <p
                data-chapter-meta
                className="max-w-sm font-editorial text-[1.0625rem] italic leading-snug text-ivory-muted md:text-editorial lg:max-w-xs"
              >
                {product.story}
              </p>
            </div>
          </div>
        </div>

        <div
          data-chapter-panel
          className="absolute inset-x-5 bottom-8 z-[3] md:inset-x-10 md:bottom-12 lg:left-auto lg:right-10 lg:w-[22rem] motion-reduce:relative motion-reduce:inset-auto motion-reduce:mx-auto motion-reduce:max-w-xl motion-reduce:px-5 motion-reduce:pb-20"
        >
          <div className="border border-line bg-ink-950/85 p-5 md:mx-auto md:max-w-md md:p-6 lg:max-w-none">
            <NotesPyramid product={product} />
            <VibeMeters product={product} compact className="mt-6" />
            <div className="mt-6 flex flex-wrap gap-3">
              <div data-chapter-cta>
                <Link
                  href={productHref(product.slug)}
                  data-cursor="view"
                  className="sheen inline-flex items-center gap-3 border border-accent-border px-4 py-3 text-label uppercase text-ivory transition-colors duration-500 hover:border-accent hover:bg-accent hover:text-on-accent"
                >
                  {brand.copy.hero.cta}
                  <span className="sr-only md:not-sr-only">{` ${product.name}`}</span>
                </Link>
              </div>
              <div data-chapter-cta>
                <ChapterOrder product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
