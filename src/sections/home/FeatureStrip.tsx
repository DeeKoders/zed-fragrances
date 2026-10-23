"use client";

import { useEffect, useRef } from "react";
import { FeatureIcon } from "@/components/ui/FeatureIcon";
import { brand } from "@/config/brand";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The 4-icon strip from the posters, split by thin gold rules. Icons draw themselves in when the
 * strip scrolls into view (only once scripts run, so they're never missing without JS).
 */
export function FeatureStrip() {
  const root = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = root.current;
    if (!element || reducedMotion) return;
    element.setAttribute("data-draw", "");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.setAttribute("data-inview", "");
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      element.removeAttribute("data-draw");
    };
  }, [reducedMotion]);

  return (
    <div ref={root} className="mx-auto max-w-6xl px-5 py-20 md:px-10 md:py-24">
      <ul className="grid grid-cols-2 gap-y-12 md:grid-cols-4">
        {brand.features.map((feature, index) => (
          <li
            key={feature.label}
            className={
              index % 2 === 1
                ? "flex flex-col items-center gap-5 border-l border-gold-700 px-4 text-center md:border-l"
                : "flex flex-col items-center gap-5 px-4 text-center md:border-l md:border-gold-700 md:first:border-l-0"
            }
          >
            <FeatureIcon icon={feature.icon} className="size-14 text-gold-300 md:size-16" />
            <span className="text-label uppercase text-ivory">{feature.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
