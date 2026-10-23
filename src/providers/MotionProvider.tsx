"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Motion components follow prefers-reduced-motion: transform animations are skipped, fades stay. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
