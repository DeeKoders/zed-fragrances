import { products } from "@/data/products";
import { OrbitHero } from "./OrbitHero";
import { SplitHero } from "./SplitHero";

/** Two products face off in a split world; any other count becomes an orbit. */
export function Hero() {
  const [first, second] = products;
  if (products.length === 2 && first && second) return <SplitHero products={[first, second]} />;
  if (products.length === 0) return null;
  return <OrbitHero products={products} />;
}
