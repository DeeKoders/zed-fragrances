"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import type { PointerEvent, ReactNode } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";

type MagneticProps = {
  children: ReactNode;
  /** Share of the pointer's offset from the centre the child follows. */
  strength?: number;
  className?: string;
};

/** Pulls its child toward the pointer on fine-pointer devices; springs back on leave. */
export function Magnetic({ children, strength = 0.3, className }: MagneticProps) {
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const reducedMotion = useReducedMotion();
  const x = useSpring(useMotionValue(0), spring.magnet);
  const y = useSpring(useMotionValue(0), spring.magnet);
  const active = finePointer && !reducedMotion;

  const onPointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (!active) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * strength);
    y.set((event.clientY - rect.top - rect.height / 2) * strength);
  };
  const onPointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ x, y }}
      className={cn("inline-block", className)}
    >
      {children}
    </motion.span>
  );
}
