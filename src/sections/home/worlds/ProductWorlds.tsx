"use client";

import { useEffect, useRef } from "react";
import { brand } from "@/config/brand";
import { products } from "@/data/products";
import { ScrollTrigger } from "@/lib/gsap";
import { HOUSE_THEME } from "@/lib/theme/types";
import { useTheme } from "@/providers/ThemeProvider";
import { useIntro } from "@/stores/intro";
import { Chapter } from "./Chapter";

/**
 * One pinned, scroll-driven chapter per product, generated from data. Inside a chapter the site
 * takes that product's theme; leaving the section returns to the house world.
 */
export function ProductWorlds() {
  const section = useRef<HTMLElement>(null);
  const { setTheme } = useTheme();
  const introDone = useIntro((state) => state.status === "done");

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    // Created after the chapters' pins (child effects run first), so its range includes their spacing.
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: "top 55%",
      end: "bottom 45%",
      onLeave: () => setTheme(HOUSE_THEME),
      onLeaveBack: () => setTheme(HOUSE_THEME),
    });
    return () => trigger.kill();
  }, [setTheme]);

  // The intro locks scrolling; measure again once it lets go.
  useEffect(() => {
    if (introDone) ScrollTrigger.refresh();
  }, [introDone]);

  return (
    <section ref={section} id="worlds" aria-labelledby="worlds-title" className="relative">
      <h2 id="worlds-title" className="sr-only">
        {brand.copy.worlds.title}
      </h2>
      {products.map((product, index) => (
        <Chapter key={product.slug} product={product} index={index} total={products.length} />
      ))}
    </section>
  );
}
