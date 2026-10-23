"use client";

import { useEffect, useId, type RefObject } from "react";
import { useAtmosphere } from "@/stores/atmosphere";

const COVERAGE = 0.95;
const THRESHOLDS = [0, 0.25, 0.5, 0.75, 0.9, 0.95, 1];

/** Marks an opaque section: while it fills ≥95% of the viewport, the WebGL atmosphere pauses. */
export function useAtmosphereCover(target: RefObject<HTMLElement | null>) {
  const id = useId();
  const setCover = useAtmosphere((state) => state.setCover);

  useEffect(() => {
    const element = target.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCover(id, entry.intersectionRect.height >= window.innerHeight * COVERAGE),
      { threshold: THRESHOLDS },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      setCover(id, false);
    };
  }, [target, id, setCover]);
}
