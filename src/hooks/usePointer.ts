"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "@/lib/gsap";

/** Smoothed pointer position over an element: -1..1 on each axis, 0 at the centre. */
export type Pointer = { x: number; y: number; active: boolean };

/**
 * Tracks a mouse or pen over `target` and eases toward it on the GSAP ticker. Returns a ref, never
 * state: read it in your own ticker callback so pointer moves don't re-render React. Returns to the
 * centre when the pointer leaves. `smoothing` is a rate per second; Infinity follows instantly.
 */
export function usePointer(target: RefObject<HTMLElement | null>, smoothing = 7) {
  const pointer = useRef<Pointer>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const element = target.current;
    if (!element) return;
    const state = pointer.current;
    const goal = { x: 0, y: 0 };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = element.getBoundingClientRect();
      goal.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      goal.y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
      state.active = true;
    };
    const onLeave = () => {
      goal.x = 0;
      goal.y = 0;
      state.active = false;
    };
    const tick = (_time: number, deltaTime: number) => {
      const k = smoothing === Infinity ? 1 : 1 - Math.exp((-deltaTime / 1000) * smoothing);
      state.x += (goal.x - state.x) * k;
      state.y += (goal.y - state.y) * k;
    };

    element.addEventListener("pointermove", onMove, { passive: true });
    element.addEventListener("pointerleave", onLeave);
    gsap.ticker.add(tick);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      gsap.ticker.remove(tick);
    };
  }, [target, smoothing]);

  return pointer;
}
