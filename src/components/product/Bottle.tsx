import Image from "next/image";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";

export function bottleAlt(product: Product) {
  const size = product.sizes[0];
  return (
    product.images.alt?.bottle ??
    `${product.name} by ${brand.name}, ${product.concentration}${size ? ` ${size.ml}ml` : ""} bottle`
  );
}

type BottleProps = {
  product: Product;
  sizes: string;
  className?: string;
  eager?: boolean;
};

/** Transparent bottle cutout in a 9:20 frame; any cutout aspect fits via object-contain. */
export function Bottle({ product, sizes, className, eager = false }: BottleProps) {
  return (
    <div className={cn("relative aspect-[9/20]", className)}>
      <Image
        src={product.images.bottle}
        alt={bottleAlt(product)}
        fill
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        className="object-contain"
      />
    </div>
  );
}
