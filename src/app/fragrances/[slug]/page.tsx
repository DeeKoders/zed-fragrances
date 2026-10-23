import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brand } from "@/config/brand";
import { getProduct, products } from "@/data/products";
import { productHref } from "@/lib/routes";
import { absoluteUrl } from "@/lib/site";
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
    openGraph: { title, description, type: "website", url: productHref(product.slug), siteName: brand.name },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProductPage({ params }: PageProps<"/fragrances/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const url = absoluteUrl(productHref(product.slug));
  const priced = product.sizes.filter((size) => size.price > 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.name} ${product.concentration}`,
    description: product.story,
    sku: product.slug,
    category: "Fragrance",
    url,
    image: [product.images.bottle, ...product.images.gallery].map(absoluteUrl),
    brand: { "@type": "Brand", name: brand.name },
    // Offers only once real prices are set; "price on request" has no valid schema price.
    ...(priced.length > 0 && {
      offers: priced.map((size) => ({
        "@type": "Offer",
        name: `${size.ml}ml`,
        price: size.price,
        priceCurrency: brand.currency,
        availability: size.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        url,
      })),
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <ProductView product={product} pairs={products.filter((entry) => entry.slug !== product.slug)} />
    </>
  );
}
