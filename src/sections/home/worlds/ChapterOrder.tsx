import Link from "next/link";
import { brand } from "@/config/brand";
import { productHref } from "@/lib/routes";
import type { Product } from "@/types/product";

/** "Order Now" in a chapter. */
export function ChapterOrder({ product }: { product: Product }) {
  return (
    <Link
      href={productHref(product.slug)}
      data-cursor="order"
      className="inline-flex items-center gap-3 bg-accent px-4 py-3 text-label uppercase text-on-accent transition-colors duration-500 hover:bg-accent-600"
    >
      {brand.copy.worlds.order}
    </Link>
  );
}
