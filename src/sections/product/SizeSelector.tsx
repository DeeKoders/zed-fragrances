import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { ProductSize } from "@/types/product";

type SizeSelectorProps = {
  name: string;
  sizes: ProductSize[];
  value: number;
  onChange: (ml: number) => void;
};

/** Native radio group styled as tiles; sold-out sizes are disabled. */
export function SizeSelector({ name, sizes, value, onChange }: SizeSelectorProps) {
  return (
    <fieldset className="mt-8">
      <legend className="text-micro uppercase text-ivory-muted">{brand.copy.product.size}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {sizes.map((size) => (
          <label
            key={size.ml}
            className={cn(
              "cursor-pointer border border-line px-4 py-3 transition-colors duration-300 hover:border-accent-border",
              "has-checked:border-gold-300 has-checked:bg-accent-soft has-disabled:cursor-not-allowed has-disabled:opacity-40",
              "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-gold-300",
            )}
          >
            <input
              type="radio"
              name={name}
              value={size.ml}
              checked={value === size.ml}
              disabled={!size.inStock}
              onChange={() => onChange(size.ml)}
              className="sr-only"
            />
            <span className="block font-display text-lg tracking-[0.08em] text-ivory">{size.ml}ml</span>
            <span className="block text-micro uppercase text-ivory-muted">
              {size.inStock ? formatPrice(size.price) : brand.copy.cart.outOfStock}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
