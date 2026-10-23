"use client";

import { Magnetic } from "@/components/motion/Magnetic";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { useCart } from "@/stores/cart";
import type { Product } from "@/types/product";

type AddToBagProps = {
  product: Product;
  /** Size to add; defaults to the first size in stock. */
  ml?: number;
  label?: string;
  className?: string;
};

/** Adds a size to the bag and opens the drawer. Disabled and relabelled when that size is sold out. */
export function AddToBag({ product, ml, label, className }: AddToBagProps) {
  const add = useCart((state) => state.add);
  const setOpen = useCart((state) => state.setOpen);
  const size =
    (ml !== undefined ? product.sizes.find((entry) => entry.ml === ml) : undefined) ??
    product.sizes.find((entry) => entry.inStock) ??
    product.sizes[0];
  const available = Boolean(size?.inStock);

  return (
    <Magnetic>
      <button
      type="button"
      data-cursor="order"
      disabled={!available}
      onClick={() => {
        if (!size) return;
        add(product.slug, size.ml);
        setOpen(true);
      }}
      className={cn(
        "sheen inline-flex items-center justify-center gap-3 bg-accent px-5 py-3.5 text-label uppercase text-on-accent transition-colors duration-500 hover:bg-accent-600 disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-ivory-muted",
        className,
      )}
    >
      {available ? (label ?? brand.copy.cart.addToBag) : brand.copy.cart.outOfStock}
      </button>
    </Magnetic>
  );
}
