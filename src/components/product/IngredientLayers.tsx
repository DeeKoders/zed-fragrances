import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Product } from "@/types/product";

/** Where props float, as % of the stage, kept clear of the centre. depth 0 far … 2 near. */
const SLOTS = [
  { x: 12, y: 20, depth: 2 },
  { x: 86, y: 28, depth: 1 },
  { x: 7, y: 62, depth: 1 },
  { x: 91, y: 68, depth: 2 },
  { x: 24, y: 88, depth: 0 },
  { x: 76, y: 12, depth: 0 },
  { x: 64, y: 86, depth: 1 },
  { x: 34, y: 10, depth: 2 },
] as const;

const DEPTH_STYLE = [
  "w-28 opacity-25 md:w-40",
  "w-16 opacity-55 md:w-24",
  "w-11 opacity-90 md:w-16",
] as const;

type Item = { key: string; label: string; src?: string; x: number; y: number; depth: 0 | 1 | 2 };

/**
 * Ingredient props in three parallax depth layers ([data-prop-layer]). Uses `product.props` images
 * when provided; otherwise stylised orbs named after the notes, as placeholders.
 */
export function IngredientLayers({ product, className }: { product: Product; className?: string }) {
  const notes = [...product.notes.top, ...product.notes.heart, ...product.notes.base];
  const sources = product.props.length > 0 ? product.props : notes;
  const items: Item[] = sources.slice(0, SLOTS.length).map((value, index) => ({
    key: `${index}-${value}`,
    label: product.props.length > 0 ? "" : value,
    src: product.props.length > 0 ? value : undefined,
    ...SLOTS[index],
  }));

  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      {([0, 1, 2] as const).map((depth) => (
        <div key={depth} data-prop-layer={depth} className="absolute inset-0">
          {items
            .filter((item) => item.depth === depth)
            .map((item) => (
              <span
                key={item.key}
                className={cn("absolute block -translate-1/2", DEPTH_STYLE[depth])}
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
              >
                {item.src ? (
                  <span className="relative block aspect-square">
                    <Image src={item.src} alt="" fill sizes="10rem" className="object-contain" />
                  </span>
                ) : (
                  <>
                    <span className="prop-orb block aspect-square rounded-full" />
                    {depth === 2 && (
                      <span className="mt-2 block whitespace-nowrap text-center text-[0.625rem] uppercase tracking-[0.3em] text-ivory-muted">
                        {item.label}
                      </span>
                    )}
                  </>
                )}
              </span>
            ))}
        </div>
      ))}
    </div>
  );
}
