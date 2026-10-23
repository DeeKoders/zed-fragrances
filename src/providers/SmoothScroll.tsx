"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useRef, type ReactNode, type RefObject } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useIntro } from "@/stores/intro";

const HEADER_OFFSET = -80;

const LenisContext = createContext<RefObject<Lenis | null> | null>(null);

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so the page runs a single animation loop and
 * ScrollTrigger stays in sync. Off when the user prefers reduced motion. Starts once the intro is
 * done, so nothing scrolls under the preloader.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenis = useRef<Lenis | null>(null);
  const reducedMotion = useReducedMotion();
  const introDone = useIntro((state) => state.status === "done");

  useEffect(() => {
    if (reducedMotion || !introDone) return;

    const instance = new Lenis({ autoRaf: false, lerp: 0.1, anchors: { offset: HEADER_OFFSET } });
    const raf = (time: number) => instance.raf(time * 1000);

    instance.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenis.current = instance;

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      lenis.current = null;
    };
  }, [reducedMotion, introDone]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

/** Ref to the running Lenis instance (null when smooth scrolling is off). Read it in effects or handlers. */
export function useLenis() {
  const context = useContext(LenisContext);
  if (!context) throw new Error("useLenis must be used inside <SmoothScroll>.");
  return context;
}
