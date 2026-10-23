"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { FloatingBottle } from "@/components/product/FloatingBottle";
import { brand } from "@/config/brand";
import { useAtmosphereCover } from "@/hooks/useAtmosphereCover";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePointer } from "@/hooks/usePointer";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/gsap";
import { duration, gsapEase } from "@/lib/motion";
import { productHref } from "@/lib/routes";
import { useTheme } from "@/providers/ThemeProvider";
import type { Product } from "@/types/product";
import { HeroScrim, ScrollCue } from "./HeroChrome";
import { HeroTagline } from "./HeroTagline";
import { KineticZed } from "./KineticZed";
import { useHeroEntrance } from "./useHeroEntrance";
import { WorldBackdrop, WorldCopy } from "./World";

const AUTOPLAY_MS = 6000;
const SWIPE_PX = 50;
/** Orbit radius as % of the track width. */
const RADIUS = { narrow: 40, wide: 26 };

/** Where item `index` sits when `position` is in front: x offset (%), scale, opacity, stacking. */
function orbitPose(index: number, position: number, count: number, radius: number) {
  let offset = (((index - position) % count) + count) % count;
  if (offset > count / 2) offset -= count;
  const angle = (offset / count) * Math.PI * 2;
  const depth = (Math.cos(angle) + 1) / 2;
  return {
    translate: `${(Math.sin(angle) * radius).toFixed(2)}% 0`,
    scale: (0.5 + 0.5 * depth).toFixed(3),
    opacity: (0.2 + 0.8 * depth ** 2).toFixed(3),
    zIndex: Math.round(depth * 100),
  };
}

/**
 * The hero for any count other than two: bottles on a 3D orbit with the active one in front, its
 * world behind and its theme across the site. Buttons, arrow keys, swipes or autoplay move it.
 * With a single product it is one still world.
 */
export function OrbitHero({ products }: { products: Product[] }) {
  const count = products.length;
  const titleId = useId();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const position = useRef({ value: 0 });
  const swipeStart = useRef<number | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const reducedMotion = useReducedMotion();
  const wide = useMediaQuery("(min-width: 768px)");
  const pointer = usePointer(section);
  const { previewTheme } = useTheme();
  useHeroEntrance(section);
  useAtmosphereCover(section);

  const radius = wide ? RADIUS.wide : RADIUS.narrow;
  const current = products[active];
  const autoplay = count > 1 && !paused && visible && !reducedMotion;

  const go = useCallback((step: number) => setActive((index) => (index + step + count) % count), [count]);

  // Turn the orbit the short way round to the active item.
  useEffect(() => {
    const items = Array.from(track.current?.children ?? []) as HTMLElement[];
    const state = position.current;
    let delta = (active - state.value) % count;
    if (delta > count / 2) delta -= count;
    if (delta < -count / 2) delta += count;

    const layout = () =>
      items.forEach((item, index) => {
        const pose = orbitPose(index, state.value, count, radius);
        item.style.translate = pose.translate;
        item.style.scale = pose.scale;
        item.style.opacity = pose.opacity;
        item.style.zIndex = String(pose.zIndex);
      });

    const tween = gsap.to(state, {
      value: state.value + delta,
      duration: reducedMotion ? 0 : duration.reveal * 1.3,
      ease: gsapEase.silk,
      onUpdate: layout,
    });
    layout();
    return () => {
      tween.kill();
    };
  }, [active, count, radius, reducedMotion]);

  useEffect(() => {
    if (!autoplay) return;
    const timer = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [autoplay, go]);

  useEffect(() => {
    const root = section.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.intersectionRatio >= 0.35);
        root.toggleAttribute("data-paused", !entry.isIntersecting);
      },
      { threshold: [0, 0.35] },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!current) return;
    previewTheme(visible ? current.slug : null);
  }, [current, visible, previewTheme]);

  useEffect(() => () => previewTheme(null), [previewTheme]);

  if (!current) return null;

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") go(1);
    if (event.key === "ArrowLeft") go(-1);
  };
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") swipeStart.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (swipeStart.current === null) return;
    const distance = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(distance) > SWIPE_PX) go(distance < 0 ? 1 : -1);
  };

  const motionPointer = reducedMotion ? undefined : pointer;

  return (
    <section
      ref={section}
      aria-labelledby={titleId}
      aria-roledescription={count > 1 ? "carousel" : undefined}
      onKeyDown={count > 1 ? onKeyDown : undefined}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => (swipeStart.current = null)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      className="relative isolate h-svh min-h-[36rem] touch-pan-y overflow-hidden bg-ink-950"
    >
      {products.map((product, index) => (
        <WorldBackdrop
          key={product.slug}
          product={product}
          side="center"
          className={cn("transition-opacity duration-800 ease-silk", index === active ? "opacity-100" : "opacity-0")}
        />
      ))}
      <HeroScrim />

      <KineticZed pointer={motionPointer} className="absolute inset-x-0 top-1/2 z-[2] -translate-y-1/2" />

      <div data-enter="lift" className="absolute inset-x-0 bottom-[34%] top-[22%] z-[3] md:bottom-[14%] md:top-[18%]">
        <div ref={track} className="relative h-full">
          {products.map((product, index) => {
            const pose = orbitPose(index, 0, count, radius);
            const isActive = index === active;
            return (
              <div
                key={product.slug}
                data-theme={product.slug}
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                style={pose}
              >
                {isActive ? (
                  <Link
                    href={productHref(product.slug)}
                    tabIndex={-1}
                    aria-hidden
                    data-cursor="view"
                    className="pointer-events-auto block h-full"
                  >
                    <FloatingBottle
                      product={product}
                      sizes="(min-width: 768px) 20rem, 11rem"
                      eager={index === 0}
                      pointer={motionPointer}
                      className="h-full"
                    />
                  </Link>
                ) : (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden
                    onClick={() => setActive(index)}
                    className="pointer-events-auto block h-full"
                  >
                    <FloatingBottle product={product} sizes="(min-width: 768px) 20rem, 11rem" className="h-full" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <HeroTagline id={titleId} className="absolute inset-x-0 top-20 z-[4] px-5 md:top-26" />

      <div
        data-enter="rise"
        aria-live={autoplay ? "off" : "polite"}
        className="absolute inset-x-0 bottom-20 z-[4] px-5 text-center md:bottom-12 md:left-12 md:right-auto md:max-w-sm md:px-0 md:text-left"
      >
        <WorldCopy key={current.slug} product={current} enter={false} className="hero-swap" />
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-[4] flex items-center justify-center gap-5 md:inset-x-auto md:bottom-12 md:right-12">
          <OrbitButton label={brand.copy.hero.previous} onClick={() => go(-1)} direction={-1} />
          <p className="min-w-[4.5rem] text-center text-label tabular-nums text-ivory-muted">
            {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </p>
          <OrbitButton label={brand.copy.hero.next} onClick={() => go(1)} direction={1} />
        </div>
      )}
      <ScrollCue className="hidden lg:flex" />
    </section>
  );
}

function OrbitButton({ label, onClick, direction }: { label: string; onClick: () => void; direction: 1 | -1 }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-11 place-items-center border border-accent-border text-ivory transition-colors duration-500 hover:bg-accent hover:text-on-accent"
    >
      <svg aria-hidden viewBox="0 0 24 24" className={cn("size-4", direction < 0 && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 12h15M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
