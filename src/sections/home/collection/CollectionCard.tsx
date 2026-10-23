"use client";

import Link from "next/link";
import { useRef, type FocusEvent, type PointerEvent } from "react";
import { FloatingBottle } from "@/components/product/FloatingBottle";
import { brand } from "@/config/brand";
import { usePointer } from "@/hooks/usePointer";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";
import { formatPrice, fromPrice } from "@/lib/format";
import { productHref } from "@/lib/routes";
import { useTheme } from "@/providers/ThemeProvider";
import type { Product } from "@/types/product";
import { WorldBackdrop } from "../hero/World";

type CollectionCardProps = {
  product: Product;
  /** Compare mode: shows a checkbox. */
  comparing?: boolean;
  selected?: boolean;
  onToggle?: () => void;
};

/** A product card: hover or focus previews its theme site-wide, tilts the bottle and reveals the notes. */
export function CollectionCard({ product, comparing = false, selected = false, onToggle }: CollectionCardProps) {
  const card = useRef<HTMLElement>(null);
  const pointer = usePointer(card);
  const reducedMotion = useReducedMotion();
  const { previewTheme } = useTheme();
  const notes = brand.copy.worlds.notes;
  const size = product.sizes[0];

  const onEnter = (event: PointerEvent) => {
    if (event.pointerType === "mouse") previewTheme(product.slug);
  };
  const onLeave = () => previewTheme(null);
  const onBlur = (event: FocusEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget)) previewTheme(null);
  };

  return (
    <article
      ref={card}
      data-theme={product.slug}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={() => previewTheme(product.slug)}
      onBlur={onBlur}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden border bg-ink-900/70 transition-colors duration-500",
        selected ? "border-gold-300" : "border-line hover:border-accent-border focus-within:border-accent-border",
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <WorldBackdrop product={product} side="center" />
        <div className="absolute inset-0 flex items-center justify-center pb-[12%]">
          <FloatingBottle
            product={product}
            sizes="(min-width: 1024px) 12rem, (min-width: 640px) 10rem, 9rem"
            pointer={reducedMotion ? undefined : pointer}
            className="h-[72%]"
          />
        </div>
        <dl className="absolute inset-x-0 bottom-0 grid translate-y-full grid-cols-3 gap-3 border-t border-accent-border bg-ink-950/90 p-4 transition-transform duration-700 ease-lux pointer-coarse:hidden group-hover:translate-y-0 group-focus-within:translate-y-0">
          {(["top", "heart", "base"] as const).map((tier) => (
            <div key={tier}>
              <dt className="text-micro uppercase text-accent-ink">{notes[tier]}</dt>
              <dd className="mt-1 text-xs leading-snug text-ivory">{product.notes[tier].join(", ")}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-micro uppercase text-accent-ink">
          {brand.copy.inspiredBy} {product.inspiredBy}
        </p>
        <h3 className="mt-3 font-display text-h3 uppercase">
          <Link
            href={productHref(product.slug)}
            data-cursor="view"
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </h3>
        <p className="mt-2 font-editorial text-lg italic text-ivory-muted">{product.tagline}</p>
        <p className="mt-3 hidden text-xs text-ivory-muted pointer-coarse:block">
          {[...product.notes.top, ...product.notes.heart, ...product.notes.base].join(" · ")}
        </p>
        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <span className="text-label uppercase text-gold-200">{formatPrice(fromPrice(product.sizes))}</span>
          <span className="text-micro uppercase text-ivory-muted">
            {product.concentration}
            {size ? ` · ${size.ml}ml` : ""}
          </span>
        </div>
        {comparing && (
          <label className="relative z-[1] mt-5 flex cursor-pointer items-center gap-3 border-t border-line pt-4 text-label uppercase text-ivory">
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggle}
              className="size-4 accent-[var(--gold-300)]"
            />
            {brand.copy.collection.select}
          </label>
        )}
      </div>
    </article>
  );
}
