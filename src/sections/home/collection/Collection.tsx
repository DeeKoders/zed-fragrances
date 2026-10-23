"use client";

import { useId, useState } from "react";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { brand } from "@/config/brand";
import { products } from "@/data/products";
import { cn } from "@/lib/cn";
import { CollectionCard } from "./CollectionCard";
import { CompareTable } from "./CompareTable";

const MAX_COMPARE = 3;
const copy = brand.copy.collection;

/** Every product as a card that adopts its world on hover, plus a side-by-side compare mode. */
export function Collection() {
  const titleId = useId();
  const [comparing, setComparing] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (slug: string) =>
    setSelected((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug].slice(-MAX_COMPARE),
    );

  const compared = products.filter((product) => selected.includes(product.slug));

  return (
    <section id="collection" aria-labelledby={titleId} className="px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-micro uppercase text-gold-400">{copy.eyebrow}</p>
            <SplitHeading id={titleId} text={copy.title} className="mt-4 font-display text-h2 uppercase" />
          </div>
          {products.length > 1 && (
            <div className="flex items-center gap-4">
              {comparing && selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  className="text-label uppercase text-ivory-muted transition-colors hover:text-gold-200"
                >
                  {copy.clear}
                </button>
              )}
              <button
                type="button"
                aria-pressed={comparing}
                onClick={() => setComparing((value) => !value)}
                className={cn(
                  "border px-5 py-3 text-label uppercase transition-colors duration-500",
                  comparing ? "border-gold-300 bg-gold-300 text-ink-950" : "border-gold-600 text-gold-200 hover:border-gold-300",
                )}
              >
                {comparing ? copy.compareDone : copy.compare}
              </button>
            </div>
          )}
        </div>
        {comparing && <p className="mt-4 text-sm text-ivory-muted">{copy.compareHint}</p>}

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <li key={product.slug}>
              <CollectionCard
                product={product}
                comparing={comparing}
                selected={selected.includes(product.slug)}
                onToggle={() => toggle(product.slug)}
              />
            </li>
          ))}
        </ul>

        {comparing && compared.length >= 2 && <CompareTable products={compared} />}
      </div>
    </section>
  );
}
