import { SplitHeading } from "@/components/motion/SplitHeading";
import { brand } from "@/config/brand";
import { getProduct } from "@/data/products";
import { reviews } from "@/data/reviews";

const STARS = [1, 2, 3, 4, 5] as const;

/** Customer reviews from src/data/reviews.ts. Hidden while there are none: never invent testimonials. */
export function Reviews() {
  if (reviews.length === 0) return null;
  const copy = brand.copy.reviews;

  return (
    <section aria-labelledby="reviews-title" className="px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-7xl">
        <p className="text-micro uppercase text-gold-400">{copy.eyebrow}</p>
        <SplitHeading id="reviews-title" text={copy.title} className="mt-4 font-display text-h2 uppercase" />
        <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, index) => {
            const product = review.product ? getProduct(review.product) : undefined;
            return (
              <li key={index} data-theme={product?.slug}>
                <figure className="flex h-full flex-col border border-line bg-ink-900/70 p-6">
                  <p aria-label={`${review.rating}/5`} className="flex gap-1 text-gold-300">
                    {STARS.map((star) => (
                      <span key={star} aria-hidden className={star <= review.rating ? "" : "opacity-25"}>
                        ◆
                      </span>
                    ))}
                  </p>
                  <blockquote className="mt-5 flex-1 font-editorial text-editorial italic text-ivory">
                    {review.text}
                  </blockquote>
                  <figcaption className="mt-6 text-micro uppercase text-ivory-muted">
                    {review.name}
                    {review.location ? ` · ${review.location}` : ""}
                    {product ? <span className="text-accent-ink"> · {product.name}</span> : null}
                  </figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
