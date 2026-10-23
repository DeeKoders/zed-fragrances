"use client";

import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "@/components/ui/Lightbox";
import { brand } from "@/config/brand";
import type { Product } from "@/types/product";

/** Product imagery as a grid; any image opens the zoomable lightbox. */
export function ProductGallery({ product }: { product: Product }) {
  const copy = brand.copy.product;
  const [open, setOpen] = useState<number | null>(null);
  const images = product.images.gallery.map((src, index) => ({
    src,
    alt: `${product.name}, ${copy.gallery.toLowerCase()} ${index + 1}`,
  }));
  if (images.length === 0) return null;

  return (
    <section aria-labelledby={`${product.slug}-gallery`} className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
      <h2 id={`${product.slug}-gallery`} className="text-micro uppercase text-gold-400">
        {copy.gallery}
      </h2>
      <ul className="mt-8 grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3">
        {images.map((image, index) => (
          <li key={image.src} className={index === 0 ? "col-span-2 row-span-2 lg:col-span-1" : undefined}>
            <button
              type="button"
              onClick={() => setOpen(index)}
              aria-label={`${copy.openImage}: ${image.alt}`}
              data-cursor="view"
              className="group relative block aspect-[3/4] w-full overflow-hidden border border-line"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover transition-transform duration-1000 ease-lux group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox images={images} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
    </section>
  );
}
