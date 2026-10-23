"use client";

import Link from "next/link";
import { useEffect, useId, useRef, type RefObject } from "react";
import { FloatingBottle } from "@/components/product/FloatingBottle";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePointer, type Pointer } from "@/hooks/usePointer";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { productHref } from "@/lib/routes";
import { useTheme } from "@/providers/ThemeProvider";
import type { Product } from "@/types/product";
import { HeroScrim, ScrollCue } from "./HeroChrome";
import { HeroTagline } from "./HeroTagline";
import { KineticZed } from "./KineticZed";
import { useHeroEntrance } from "./useHeroEntrance";
import { halfBox, WorldBackdrop, WorldCopy } from "./World";

/** How far the favoured world widens, in % of the hero. */
const SEAM_SHIFT = 12;
/** Phones: how far the seam rises as the hero scrolls away, in % of the hero. */
const SCROLL_PUSH = 30;
/** Pointer distance from the centre (0..1) ignored before a world starts to win. */
const DEAD_ZONE = 0.08;
/** A world takes over the site theme past TAKEOVER and lets go below RELEASE. */
const TAKEOVER = 0.4;
const RELEASE = 0.2;
/** Idle sway amplitude and speed (rad/s), so the hero never sits still. */
const SWAY = 0.18;
const SWAY_SPEED = 0.6;
/** Share of the hero that must be on screen for it to own the theme. */
const IN_VIEW = 0.35;

/** Live balance between the worlds (-1 first, 1 second). Read per frame, e.g. by the WebGL seam. */
export const heroBalance = { value: 0 };

const shape = (raw: number) =>
  Math.sign(raw) * Math.min(1, Math.max(0, (Math.abs(raw) - DEAD_ZONE) / 0.6));

function need<T extends Element>(element: T | null): T {
  if (!element) throw new Error("SplitHero: missing element");
  return element;
}

/**
 * Two worlds side by side (stacked on phones). The pointer, a tap, keyboard focus or an idle sway
 * sets a balance; the favoured world widens and brightens, the other dims, and past a threshold the
 * whole site takes the favoured world's theme. The seam moves by sliding the second world's clip
 * one way and its content the other: transforms only, nothing repaints.
 */
export function SplitHero({ products }: { products: [Product, Product] }) {
  const [first, second] = products;
  const titleId = useId();
  const section = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const wide = useMediaQuery("(min-width: 768px)");
  const pointer = usePointer(section, reducedMotion ? Infinity : 7);
  const { previewTheme } = useTheme();
  useHeroEntrance(section);

  useEffect(() => {
    const root = section.current;
    if (!root) return;
    const axis = wide ? "x" : "y";
    const sides = ["a", "b"] as const;
    const slugs = [first.slug, second.slug];
    const one = <T extends HTMLElement>(selector: string) => need(root.querySelector<T>(selector));

    const clip = one("[data-seam-clip]");
    const inner = one("[data-seam-inner]");
    const seam = one("[data-seam]");
    const stages = sides.map((side) => one(`[data-stage="${side}"]`));
    const emphasis = sides.map((side) => one(`[data-stage="${side}"] [data-emphasis]`));
    const copies = sides.map((side) => one(`[data-stage="${side}"] [data-copy]`));
    const dims = sides.map((side) => one(`[data-world="${side}"] [data-world-dim]`));
    const glows = sides.map((side) => one(`[data-world="${side}"] [data-world-glow]`));
    const touched = [clip, inner, seam, ...stages, ...emphasis, ...copies, ...dims, ...glows];

    let tap: number | null = null;
    let focus: number | null = null;
    let balance = 0;
    let favoured: number | null = null;
    let visible = true;
    let inView = true;
    let last = "";

    const sideOf = (target: EventTarget | null) => {
      const host = target instanceof Element ? target.closest("[data-world], [data-stage]") : null;
      const side = host?.getAttribute("data-world") ?? host?.getAttribute("data-stage");
      return side === "a" ? -1 : side === "b" ? 1 : null;
    };

    const setFavoured = (next: number | null) => {
      if (next === favoured) return;
      favoured = next;
      previewTheme(next === null ? null : slugs[next]);
    };

    const along = (value: number) => (axis === "x" ? `${value}% 0` : `0 ${value}%`);

    const apply = (seamAt: number) => {
      if (!reducedMotion) {
        clip.style.translate = seam.style.translate = along(seamAt);
        inner.style.translate = along(-seamAt);
        // Stages are half the hero, so this keeps each centred in its widened or narrowed half.
        stages.forEach((stage) => (stage.style.translate = along(seamAt - 50)));
      }
      const favour = [Math.max(0, -balance), Math.max(0, balance)];
      sides.forEach((_, index) => {
        const mine = favour[index];
        const theirs = favour[1 - index];
        dims[index].style.opacity = (theirs * 0.6).toFixed(3);
        glows[index].style.opacity = (0.6 + mine * 0.4).toFixed(3);
        copies[index].style.opacity = (1 - theirs * 0.5).toFixed(3);
        if (!reducedMotion) emphasis[index].style.scale = (1 + mine * 0.04 - theirs * 0.08).toFixed(4);
      });
    };

    const trigger = ScrollTrigger.create({ trigger: root, start: "top top", end: "bottom top" });

    const tick = (time: number, deltaTime: number) => {
      if (!visible) return;
      const { active, x, y } = pointer.current;
      const engaged = focus !== null || active || tap !== null;
      const target =
        focus ?? (active ? shape(axis === "x" ? x : y) : (tap ?? (reducedMotion ? 0 : Math.sin(time * SWAY_SPEED) * SWAY)));

      balance += (target - balance) * (reducedMotion ? 1 : 1 - Math.exp((-deltaTime / 1000) * 5));
      heroBalance.value = balance;

      if (!engaged || !inView) setFavoured(null);
      else if (balance < -TAKEOVER) setFavoured(0);
      else if (balance > TAKEOVER) setFavoured(1);
      else if (Math.abs(balance) < RELEASE) setFavoured(null);

      const push = axis === "y" ? trigger.progress * SCROLL_PUSH : 0;
      const seamAt = Math.min(90, Math.max(10, 50 - balance * SEAM_SHIFT - push));
      const key = `${seamAt.toFixed(2)} ${balance.toFixed(3)}`;
      if (key === last) return;
      last = key;
      apply(seamAt);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        inView = entry.intersectionRatio >= IN_VIEW;
        root.toggleAttribute("data-paused", !visible);
        if (!inView) setFavoured(null);
      },
      { threshold: [0, IN_VIEW] },
    );

    // Touch: tap a world to favour it, tap it again to let go. Mice follow the pointer instead.
    const onClick = (event: MouseEvent) => {
      // Older Safari dispatches clicks as MouseEvent, without pointerType.
      const type = (event as PointerEvent).pointerType ?? (matchMedia("(hover: hover)").matches ? "mouse" : "touch");
      if (type === "mouse") return;
      if (event.target instanceof Element && event.target.closest("a, button")) return;
      const side = sideOf(event.target);
      if (side !== null) tap = tap === side ? null : side;
    };
    const onFocusIn = (event: FocusEvent) => {
      focus = sideOf(event.target);
    };
    const onFocusOut = () => {
      focus = null;
    };

    observer.observe(root);
    root.addEventListener("click", onClick);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      observer.disconnect();
      trigger.kill();
      root.removeEventListener("click", onClick);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      root.removeAttribute("data-paused");
      touched.forEach((element) => {
        element.style.translate = "";
        element.style.scale = "";
        element.style.opacity = "";
      });
      setFavoured(null);
      heroBalance.value = 0;
    };
  }, [first.slug, second.slug, wide, reducedMotion, pointer, previewTheme]);

  const motionPointer = reducedMotion ? undefined : pointer;

  return (
    <section
      ref={section}
      aria-labelledby={titleId}
      className="relative isolate h-svh min-h-[36rem] overflow-hidden bg-ink-950"
    >
      <WorldBackdrop product={first} side="a" />
      <div data-seam-clip className="absolute inset-0 translate-y-1/2 overflow-hidden md:translate-x-1/2 md:translate-y-0">
        <div data-seam-inner className="absolute inset-0 -translate-y-1/2 md:-translate-x-1/2 md:translate-y-0">
          <WorldBackdrop product={second} side="b" />
        </div>
      </div>
      <div
        data-seam
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] translate-y-1/2 md:translate-x-1/2 md:translate-y-0"
      >
        <span
          data-enter="fade"
          className="seam-line absolute inset-x-0 top-0 h-px md:inset-x-auto md:inset-y-0 md:left-0 md:h-auto md:w-px"
        />
      </div>
      <HeroScrim />

      <KineticZed pointer={motionPointer} className="absolute inset-x-0 top-1/2 z-[2] -translate-y-1/2" />

      <Stage product={first} side="a" pointer={motionPointer} />
      <Stage product={second} side="b" pointer={motionPointer} />

      <HeroTagline
        id={titleId}
        className="absolute inset-x-0 top-[calc(50%+var(--text-mega)*0.42)] z-[4] px-5 md:top-26"
      />
      <ScrollCue className="hidden md:flex" />
    </section>
  );
}

type StageProps = { product: Product; side: "a" | "b"; pointer?: RefObject<Pointer> };

/** One world's bottle and copy. Phones: a row beside the seam band. Tablet: a column. Desktop: copy outside, bottle by the seam. */
function Stage({ product, side, pointer }: StageProps) {
  const isA = side === "a";

  return (
    <div
      data-stage={side}
      data-theme={product.slug}
      className={cn(
        halfBox(side),
        "z-[3] flex items-center gap-5 px-5 md:flex-col md:justify-center md:gap-8 md:px-8 md:pb-12 md:pt-24 lg:justify-between lg:px-12",
        isA ? "flex-row pb-[12svh] pt-16 lg:flex-row-reverse" : "flex-row-reverse pb-4 pt-[16svh] lg:flex-row",
      )}
    >
      <div data-enter="lift" className="shrink-0">
        <div data-emphasis className="origin-bottom">
          <Link href={productHref(product.slug)} tabIndex={-1} aria-hidden data-cursor="view" className="block">
            <FloatingBottle
              product={product}
              sizes="(min-width: 1024px) 20rem, (min-width: 768px) 14rem, 9rem"
              eager
              pointer={pointer}
              depth={isA ? 1 : 1.25}
              floatDelay={isA ? 0 : -3}
              className="h-[28svh] md:h-[40svh] lg:h-[min(56svh,38rem)]"
            />
          </Link>
        </div>
      </div>
      <div
        data-copy
        className={cn(
          "min-w-0 flex-1 md:flex-none md:text-center lg:max-w-xs lg:self-end",
          isA ? "lg:text-left" : "lg:text-right",
        )}
      >
        <WorldCopy product={product} />
      </div>
    </div>
  );
}
