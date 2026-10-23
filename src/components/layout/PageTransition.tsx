"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap } from "@/lib/gsap";
import { gsapEase } from "@/lib/motion";
import { useLenis } from "@/providers/SmoothScroll";

/** Reveals anyway if a navigation never lands. */
const FAILSAFE_MS = 4000;

/**
 * Ink wipe between pages in the active accent: internal link clicks are held while the ink covers
 * the screen, then the route changes and the ink lifts. Clicks are only marked defaultPrevented
 * (never stopped), so the link's own handlers still run and Next.js skips its own navigation.
 * Off for reduced motion, modified clicks, new tabs, downloads and same-page links.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const lenis = useLenis();
  const overlay = useRef<HTMLDivElement>(null);
  const pending = useRef<{ hash: string; timer: number } | null>(null);
  const revealRef = useRef<() => void>(() => {});

  useEffect(() => {
    const element = overlay.current;
    if (reducedMotion || !element) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!anchor || (anchor.target && anchor.target !== "_self") || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;

      event.preventDefault();
      if (pending.current) return;
      const href = `${url.pathname}${url.search}${url.hash}`;
      pending.current = { hash: url.hash, timer: window.setTimeout(() => reveal(), FAILSAFE_MS) };
      gsap.killTweensOf(element);
      gsap.set(element, { visibility: "visible", transformOrigin: "50% 100%" });
      gsap.fromTo(element, { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: gsapEase.silk, onComplete: () => router.push(href) });
    };

    const reveal = () => {
      if (!pending.current) return;
      window.clearTimeout(pending.current.timer);
      pending.current = null;
      gsap.set(element, { transformOrigin: "50% 0%" });
      gsap.to(element, {
        scaleY: 0,
        duration: 0.7,
        delay: 0.1,
        ease: gsapEase.silk,
        onComplete: () => gsap.set(element, { visibility: "hidden" }),
      });
    };

    revealRef.current = reveal;
    window.addEventListener("click", onClick, true);
    return () => window.removeEventListener("click", onClick, true);
  }, [reducedMotion, router]);

  // A new route has rendered under the ink: start it at the top (unless it targets an anchor) and lift.
  useEffect(() => {
    if (!pending.current) return;
    if (!pending.current.hash) {
      lenis.current?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
    }
    revealRef.current();
  }, [pathname, lenis]);

  return (
    <div
      ref={overlay}
      aria-hidden
      className="page-ink pointer-events-none invisible fixed inset-0 z-[68] flex items-center justify-center"
      style={{ transform: "scaleY(0)" }}
    >
      <span className="size-2 rotate-45 bg-gold-300" />
    </div>
  );
}
