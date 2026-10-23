"use client";

import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { brand } from "@/config/brand";
import type { Pointer } from "@/hooks/usePointer";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/gsap";

/** Per-letter parallax depth, so the letters drift apart with the pointer. */
const DEPTHS = [1.3, 0.7, 1.1, 0.9];

type KineticZedProps = {
  /** Letters drift and skew with this pointer. Omit for still type (reduced motion). */
  pointer?: RefObject<Pointer>;
  className?: string;
};

/**
 * The brand's short name as massive kinetic type in gold. Decorative: the hero's <h1> carries the
 * name for assistive tech. Each letter has an outer span for the entrance ([data-enter="zed"]) and
 * an inner one for pointer motion, plus a glint copy that pulses in turn (opacity only).
 */
export function KineticZed({ pointer, className }: KineticZedProps) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!pointer || !element) return;
    const letters = Array.from(element.querySelectorAll<HTMLElement>("[data-zed-letter]"));
    let last = "";

    const tick = () => {
      const { x, y } = pointer.current;
      const key = `${x.toFixed(3)} ${y.toFixed(3)}`;
      if (key === last) return;
      last = key;
      letters.forEach((letter, index) => {
        const depth = DEPTHS[index % DEPTHS.length];
        letter.style.transform = `translate3d(${(x * depth * 6).toFixed(2)}%, ${(y * depth * 4).toFixed(2)}%, 0) skewX(${(-x * depth * 4).toFixed(2)}deg)`;
      });
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      letters.forEach((letter) => (letter.style.transform = ""));
    };
  }, [pointer]);

  return (
    <div
      ref={root}
      aria-hidden
      className={cn("pointer-events-none flex select-none justify-center font-display text-mega", className)}
    >
      {Array.from(brand.shortName).map((letter, index) => (
        <span key={index} data-enter="zed" className="inline-block origin-bottom">
          <span data-zed-letter className="relative inline-block leading-none text-gold-metal">
            {letter}
            <span
              className="zed-glint text-gold-glint absolute inset-0"
              style={{ "--i": index } as CSSProperties}
            >
              {letter}
            </span>
          </span>
        </span>
      ))}
    </div>
  );
}
