"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { brand } from "@/config/brand";
import { useDialog } from "@/hooks/useDialog";
import { cn } from "@/lib/cn";

export type LightboxImage = { src: string; alt: string };

type LightboxProps = {
  images: LightboxImage[];
  /** Open image, or null when closed. */
  index: number | null;
  onIndex: (index: number) => void;
  onClose: () => void;
};

const ZOOM = 2.4;
const controlClass =
  "grid size-12 place-items-center border border-line bg-ink-950/70 text-ivory transition-colors hover:border-gold-300 hover:text-gold-200";

/** Full-screen gallery with click-to-zoom that follows the pointer, arrow keys and Escape. */
export function Lightbox({ images, index, onIndex, onClose }: LightboxProps) {
  const copy = brand.copy.product;
  const panel = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const open = index !== null;
  const count = images.length;

  const close = useCallback(() => {
    setZoomed(false);
    onClose();
  }, [onClose]);

  useDialog(open, panel, close);

  const go = useCallback(
    (step: number) => {
      if (index === null) return;
      setZoomed(false);
      onIndex((index + step + count) % count);
    },
    [index, count, onIndex],
  );

  useEffect(() => {
    if (!open || count < 2) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, count, go]);

  const aim = (event: MouseEvent | PointerEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    if (image.current) image.current.style.transformOrigin = `${x}% ${y}%`;
  };

  const current = index === null ? undefined : images[index];

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-label={copy.gallery}
          data-lenis-prevent
          className="fixed inset-0 z-[66] flex items-center justify-center bg-ink-950/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <button
            type="button"
            aria-label={copy.zoom}
            aria-pressed={zoomed}
            onClick={(event) => {
              aim(event);
              setZoomed((value) => !value);
            }}
            onPointerMove={(event) => zoomed && aim(event)}
            className={cn("relative h-[84svh] w-[92vw] overflow-hidden", zoomed ? "cursor-zoom-out" : "cursor-zoom-in")}
          >
            <Image
              ref={image}
              key={current.src}
              src={current.src}
              alt={current.alt}
              fill
              sizes="92vw"
              className="object-contain transition-transform duration-500 ease-lux"
              style={{ transform: `scale(${zoomed ? ZOOM : 1})` }}
            />
          </button>

          <button type="button" onClick={close} aria-label={copy.close} className={cn(controlClass, "absolute right-4 top-4")}>
            <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
          {count > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} aria-label={copy.previous} className={cn(controlClass, "absolute left-4 top-1/2 -translate-y-1/2")}>
                ←
              </button>
              <button type="button" onClick={() => go(1)} aria-label={copy.next} className={cn(controlClass, "absolute right-4 top-1/2 -translate-y-1/2")}>
                →
              </button>
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-label tabular-nums text-ivory-muted">
                {(index ?? 0) + 1} / {count}
              </p>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
