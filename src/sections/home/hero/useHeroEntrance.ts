"use client";

import { useEffect, type RefObject } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap } from "@/lib/gsap";
import { gsapEase } from "@/lib/motion";
import { useIntro } from "@/stores/intro";

/**
 * Plays the hero entrance as the preloader curtain opens, or on load when it didn't play. Animates
 * [data-enter] elements from the starting poses in globals.css, so nothing jumps before hydration.
 * Keep the `from` values in sync with those poses.
 */
export function useHeroEntrance(scope: RefObject<HTMLElement | null>) {
  const reducedMotion = useReducedMotion();
  const ready = useIntro((state) => state.status === "revealing" || state.status === "done");

  useEffect(() => {
    const root = scope.current;
    if (!root || !ready || reducedMotion) return;
    const select = gsap.utils.selector(root);

    const context = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: gsapEase.lux } })
        .fromTo(
          select('[data-enter="zed"]'),
          { yPercent: 24, rotation: 4 },
          { yPercent: 0, rotation: 0, duration: 1.6, stagger: 0.09 },
          0,
        )
        .fromTo(select('[data-enter="lift"]'), { yPercent: 8 }, { yPercent: 0, duration: 1.6, stagger: 0.12 }, 0.1)
        .fromTo(select('[data-enter="word"]'), { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.06 }, 0.3)
        .fromTo(
          select('[data-enter="rise"]'),
          { yPercent: 60, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1, stagger: 0.06 },
          0.45,
        )
        .fromTo(select('[data-enter="fade"]'), { opacity: 0 }, { opacity: 1, duration: 1.2 }, 0.5);
    }, root);

    return () => context.revert();
  }, [scope, ready, reducedMotion]);
}
