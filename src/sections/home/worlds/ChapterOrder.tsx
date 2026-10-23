import { AddToBag } from "@/components/cart/AddToBag";
import { brand } from "@/config/brand";
import type { Product } from "@/types/product";

/** "Order Now": adds the default size to the bag and opens it. */
export function ChapterOrder({ product }: { product: Product }) {
  return <AddToBag product={product} label={brand.copy.worlds.order} className="px-4 py-3" />;
}
