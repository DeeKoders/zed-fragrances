import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";

const TIERS = [
  { key: "top", width: "w-[62%]" },
  { key: "heart", width: "w-[82%]" },
  { key: "base", width: "w-full" },
] as const;

/** Top, heart and base notes stacked as a pyramid. Tiers carry [data-tier] for scroll reveals. */
export function NotesPyramid({ product, className }: { product: Product; className?: string }) {
  const labels = brand.copy.worlds.notes;

  return (
    <div className={className}>
      <p className="text-micro uppercase text-gold-400">{labels.title}</p>
      <div className="mt-4 flex flex-col items-center">
        <span aria-hidden className="mb-2 size-1.5 rotate-45 bg-gold-300" />
        <dl className="w-full">
          {TIERS.map(({ key, width }) => (
            <div
              key={key}
              data-tier={key}
              className={cn("mx-auto border-t border-accent-border bg-accent-soft px-3 py-2 text-center md:py-2.5", width)}
            >
              <dt className="text-micro uppercase text-accent-ink">{labels[key]}</dt>
              <dd className="mt-1 text-sm text-ivory">{product.notes[key].join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
