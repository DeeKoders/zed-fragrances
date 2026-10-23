"use client";

import { useEffect, useState } from "react";
import { supportsWebGL } from "@/lib/webgl";
import { useIntro } from "@/stores/intro";
import { useReducedMotion } from "./useReducedMotion";

/**
 * True once WebGL layers may load: the intro is over, the browser is idle, WebGL works and the
 * user hasn't asked for reduced motion. Until then (and otherwise) the static fallbacks show.
 */
export function useWebGLReady() {
  const reducedMotion = useReducedMotion();
  const introDone = useIntro((state) => state.status === "done");
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (!introDone || reducedMotion) return;
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setIdle(true), { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setIdle(true), 300);
    return () => clearTimeout(id);
  }, [introDone, reducedMotion]);

  return idle && introDone && !reducedMotion && supportsWebGL();
}
