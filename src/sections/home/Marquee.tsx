"use client";

import { Fragment, useEffect, useRef } from "react";
import { brand } from "@/config/brand";
import { products } from "@/data/products";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/** Pixels per second at rest, and how much scroll velocity adds. */
const BASE_SPEED = 50;
const VELOCITY_GAIN = 0.18;
const MAX_BOOST = 1200;
const COPIES = 3;

const labels = Array.from(new Set([...brand.features, ...products.flatMap((product) => product.features)].map((f) => f.label)));

/**
 * Two infinite strips of tracked gold caps running in opposite directions. Speed follows scroll
 * velocity and the direction flips with the scroll. Transform only; still for reduced motion.
 */
export function Marquee() {
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = root.current;
    if (!element || reducedMotion) return;
    const rows = Array.from(element.querySelectorAll<HTMLElement>("[data-marquee-row]"));
    const widths = rows.map((row) => (row.firstElementChild as HTMLElement).offsetWidth);
    const offsets = rows.map(() => 0);
    let direction = 1;
    let visible = false;

    const resize = new ResizeObserver(() => {
      rows.forEach((row, index) => (widths[index] = (row.firstElementChild as HTMLElement).offsetWidth));
    });
    rows.forEach((row) => resize.observe(row));

    const trigger = ScrollTrigger.create({ trigger: element, start: "top bottom", end: "bottom top" });
    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    observer.observe(element);

    const tick = (_time: number, deltaTime: number) => {
      if (!visible) return;
      const velocity = trigger.getVelocity();
      if (Math.abs(velocity) > 20) direction = Math.sign(velocity);
      const speed = BASE_SPEED + Math.min(Math.abs(velocity) * VELOCITY_GAIN, MAX_BOOST);
      rows.forEach((row, index) => {
        const width = widths[index] || 1;
        const sign = index % 2 === 0 ? -1 : 1;
        let offset = offsets[index] + sign * direction * speed * (deltaTime / 1000);
        offset = (((offset % width) + width) % width) - width;
        offsets[index] = offset;
        row.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0)`;
      });
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      trigger.kill();
      observer.disconnect();
      resize.disconnect();
      rows.forEach((row) => (row.style.transform = ""));
    };
  }, [reducedMotion]);

  return (
    <div ref={root} aria-hidden className="relative overflow-hidden border-y border-line bg-ink-950 py-6 md:py-8">
      {(["gold", "outline"] as const).map((style) => (
        <div key={style} data-marquee-row className={cn("flex w-max", style === "outline" && "mt-3 md:mt-4")}>
          {Array.from({ length: COPIES }, (_, copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {labels.map((label) => (
                <Fragment key={label}>
                  <span
                    className={cn(
                      "whitespace-nowrap px-6 font-display text-[clamp(1.125rem,2.6vw,2rem)] uppercase tracking-[0.3em] md:px-10",
                      style === "gold" ? "text-gold-metal" : "text-outline",
                    )}
                  >
                    {label}
                  </span>
                  <span className="size-1.5 shrink-0 rotate-45 bg-gold-400" />
                </Fragment>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
