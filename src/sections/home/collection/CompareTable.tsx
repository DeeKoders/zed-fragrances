import type { ReactNode } from "react";
import { brand } from "@/config/brand";
import { formatPrice } from "@/lib/format";
import type { Level, Product } from "@/types/product";

const SEGMENTS = [1, 2, 3, 4, 5] as const;

function Dots({ value, label }: { value: Level; label: string }) {
  return (
    <span role="img" aria-label={`${label} ${value}/5`} className="flex gap-1">
      {SEGMENTS.map((segment) => (
        <span key={segment} className={segment <= value ? "h-1.5 w-5 bg-accent" : "h-1.5 w-5 bg-ink-700"} />
      ))}
    </span>
  );
}

/** Side-by-side comparison of the selected products. Scrolls sideways on narrow screens. */
export function CompareTable({ products }: { products: Product[] }) {
  const { collection, worlds } = brand.copy;
  const rows: { label: string; cell: (product: Product) => ReactNode }[] = [
    { label: collection.inspiredBy, cell: (product) => product.inspiredBy },
    { label: collection.concentration, cell: (product) => product.concentration },
    { label: worlds.notes.top, cell: (product) => product.notes.top.join(", ") },
    { label: worlds.notes.heart, cell: (product) => product.notes.heart.join(", ") },
    { label: worlds.notes.base, cell: (product) => product.notes.base.join(", ") },
    {
      label: worlds.vibe.longevity,
      cell: (product) => <Dots value={product.vibe.longevity} label={worlds.vibe.longevity} />,
    },
    {
      label: worlds.vibe.projection,
      cell: (product) => <Dots value={product.vibe.projection} label={worlds.vibe.projection} />,
    },
    { label: worlds.vibe.seasons, cell: (product) => product.vibe.seasons.join(", ") },
    { label: worlds.vibe.occasions, cell: (product) => product.vibe.occasions.join(", ") },
    {
      label: collection.sizes,
      cell: (product) => product.sizes.map((size) => `${size.ml}ml · ${formatPrice(size.price)}`).join(" / "),
    },
  ];

  return (
    <div className="mt-12 overflow-x-auto border border-line">
      <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
        <caption className="sr-only">{collection.compare}</caption>
        <thead>
          <tr>
            <td className="w-40 border-b border-line p-4" />
            {products.map((product) => (
              <th key={product.slug} scope="col" data-theme={product.slug} className="border-b border-line p-4">
                <span className="font-display text-h3 uppercase text-accent-fill">{product.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-line last:border-b-0">
              <th scope="row" className="p-4 text-micro font-semibold uppercase text-ivory-muted">
                {row.label}
              </th>
              {products.map((product) => (
                <td key={product.slug} data-theme={product.slug} className="p-4 capitalize text-ivory">
                  {row.cell(product)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
