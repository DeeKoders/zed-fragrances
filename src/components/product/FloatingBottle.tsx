"use client";

import Image, { getImageProps } from "next/image";
import { useEffect, useRef, type RefObject } from "react";
import type { Pointer } from "@/hooks/usePointer";
import { cn } from "@/lib/cn";
import { gsap } from "@/lib/gsap";
import type { Product } from "@/types/product";
import { Bottle } from "./Bottle";

/** Bottle frames are 9:20; the mask needs explicit dimensions. 320px → its 2x candidate is 640w. */
const MASK_WIDTH = 320;
const MASK_HEIGHT = Math.round((MASK_WIDTH * 20) / 9);

const MAX_TILT_Y = 12;
const MAX_TILT_X = 8;

type FloatingBottleProps = {
  product: Product;
  sizes: string;
  /** Sizing for the 9:20 frame, e.g. a height. */
  className?: string;
  eager?: boolean;
  /** Tilts toward this pointer. Omit for a still bottle (reduced motion). */
  pointer?: RefObject<Pointer>;
  /** Parallax strength while tilting. */
  depth?: number;
  /** Seconds; desyncs the idle bob between bottles. */
  floatDelay?: number;
};

/**
 * A bottle cutout that bobs, tilts in 3D toward the pointer and catches a moving highlight, standing
 * on a reflective floor. Transform and opacity only; the highlight is clipped to the bottle's alpha.
 */
export function FloatingBottle({
  product,
  sizes,
  className,
  eager = false,
  pointer,
  depth = 1,
  floatDelay = 0,
}: FloatingBottleProps) {
  const tilt = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const body = tilt.current;
    const band = sheen.current;
    if (!pointer || !body || !band) return;
    let last = "";

    const tick = () => {
      const { x, y } = pointer.current;
      const transform = `perspective(80rem) translate3d(${(x * depth * 4).toFixed(2)}%, ${(y * depth * 2.5).toFixed(2)}%, 0) rotateX(${(-y * MAX_TILT_X).toFixed(2)}deg) rotateY(${(x * MAX_TILT_Y).toFixed(2)}deg)`;
      if (transform === last) return;
      last = transform;
      body.style.transform = transform;
      band.style.translate = `${(x * 70).toFixed(2)}% 0`;
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      body.style.transform = "";
      band.style.translate = "";
    };
  }, [pointer, depth]);

  const mask = getImageProps({
    src: product.images.bottle,
    width: MASK_WIDTH,
    height: MASK_HEIGHT,
    alt: "",
  }).props.src;

  return (
    <div className={cn("relative aspect-[9/20]", className)}>
      <div className="bottle-float h-full" style={{ animationDelay: `${floatDelay}s` }}>
        <div ref={tilt} className="relative h-full">
          <span aria-hidden className="bottle-contact absolute left-1/2 top-full h-[7%] w-[130%] -translate-1/2" />
          <div aria-hidden className="bottle-reflection absolute inset-x-0 top-full h-full -scale-y-100">
            <Image
              src={product.images.bottle}
              alt=""
              fill
              sizes={sizes}
              loading={eager ? "eager" : "lazy"}
              className="object-contain"
            />
          </div>
          <Bottle product={product} sizes={sizes} eager={eager} className="h-full" />
          <span aria-hidden className="bottle-sheen absolute inset-0" style={{ maskImage: `url("${mask}")` }}>
            <span ref={sheen} className="bottle-sheen-band absolute inset-y-0 -left-1/4 w-3/4" />
          </span>
        </div>
      </div>
    </div>
  );
}
