import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { getProduct, products } from "@/data/products";
import { productHref } from "@/lib/routes";
import { ProductView } from "@/sections/product/ProductView";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps<"/fragrances/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const title = product.seo?.title ?? `${product.name} · ${brand.copy.inspiredBy} ${product.inspiredBy}`;
  const description = product.seo?.description ?? product.story;
  return {
    title,
    description,
    alternates: { canonical: productHref(product.slug) },
    openGraph: { title, description, type: "website", url: productHref(product.slug) },
  };
}

export default async function ProductPage({ params }: PageProps<"/fragrances/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return <ProductView product={product} pairs={products.filter((entry) => entry.slug !== product.slug)} />;
}
