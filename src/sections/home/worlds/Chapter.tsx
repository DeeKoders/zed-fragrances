"use client";

import { useEffect, useRef } from "react";
import { FloatingBottle } from "@/components/product/FloatingBottle";
import { brand } from "@/config/brand";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useTheme } from "@/providers/ThemeProvider";
import type { Product } from "@/types/product";
import { WorldBackdrop } from "../hero/World";

const pad = (value: number) => String(value).padStart(2, "0");

type ChapterProps = { product: Product; index: number; total: number };

/**
 * A product chapter: pinned for a stretch of scroll while its name fills from outline to colour and
 * the bottle turns at centre stage. Reduced motion: no pin or scrub, everything shown at rest.
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
      { motion: "(prefers-reduced-motion: no-preference)", wide: "(min-width: 768px)" },
      (context) => {
        const { motion, wide } = context.conditions as { motion: boolean; wide: boolean };
        if (!motion) return;

        gsap.set(select("[data-chapter-bottle]"), { transformPerspective: 1200 });
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: select("[data-chapter-stage]")[0],
              start: "top top",
              end: () => `+=${window.innerHeight * (wide ? 2 : 1.5)}`,
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
          .fromTo(select("[data-name-window]"), { xPercent: -101 }, { xPercent: 0, duration: 0.4 }, 0)
          .fromTo(select("[data-name-fill]"), { xPercent: 101 }, { xPercent: 0, duration: 0.4 }, 0)
          .fromTo(select("[data-name-drift]"), { xPercent: 4 }, { xPercent: -4, duration: 1 }, 0)
          .fromTo(
            select("[data-chapter-bottle]"),
            { rotationY: -35, scale: 0.78, yPercent: 8 },
            { rotationY: 0, scale: 1, yPercent: 0, duration: 0.55, ease: "power2.out" },
            0,
          )
          .to(select("[data-chapter-bottle]"), { rotationY: 18, scale: 0.94, yPercent: -3, duration: 0.45, ease: "power1.in" }, 0.55)
          .fromTo(
            select("[data-chapter-meta]"),
            { yPercent: 40, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.2, stagger: 0.05, ease: "power2.out" },
            0.05,
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
      <div data-chapter-stage className="relative h-svh min-h-[36rem] overflow-hidden bg-ink-950">
        <WorldBackdrop product={product} side="center" />

        <h3
          id={titleId}
          className="pointer-events-none absolute inset-x-0 top-[24%] z-[1] text-center font-display text-[13vw] uppercase leading-none tracking-[0.04em] md:top-1/2 md:-translate-y-1/2 md:text-display"
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

        <div className="absolute left-1/2 top-[58%] z-[2] -translate-1/2 md:top-1/2">
          <div data-chapter-bottle>
            <FloatingBottle
              product={product}
              sizes="(min-width: 768px) 22rem, 12rem"
              floatDelay={index * -2}
              className="h-[42svh] md:h-[min(64svh,44rem)]"
            />
          </div>
        </div>

        <div className="relative z-[3] mx-auto flex h-full max-w-7xl flex-col justify-between px-5 pb-8 pt-20 md:px-10 md:pb-12 md:pt-28">
          <div className="flex items-start justify-between gap-6 text-micro uppercase">
            <p data-chapter-meta className="text-gold-400 tabular-nums">
              {pad(index + 1)} / {pad(total)}
            </p>
            <p data-chapter-meta className="text-right text-accent-ink">
              {brand.copy.inspiredBy} {product.inspiredBy}
            </p>
          </div>
          <p
            data-chapter-meta
            className="max-w-sm font-editorial text-[1.0625rem] italic leading-snug text-ivory-muted md:text-editorial"
          >
            {product.story}
          </p>
        </div>
      </div>
    </article>
  );
}
