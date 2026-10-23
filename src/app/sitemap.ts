import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { productHref } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    ...products.map((product) => ({
      url: absoluteUrl(productHref(product.slug)),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
