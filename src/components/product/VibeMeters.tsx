import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import type { Level, Product } from "@/types/product";

const SEGMENTS = [1, 2, 3, 4, 5] as const;

function Meter({ label, value }: { label: string; value: Level }) {
  return (
    <div role="meter" aria-label={label} aria-valuemin={1} aria-valuemax={5} aria-valuenow={value} className="flex items-center gap-4">
      <span className="w-24 shrink-0 text-micro uppercase text-ivory-muted">{label}</span>
      <span aria-hidden className="flex flex-1 gap-1">
        {SEGMENTS.map((segment) => (
          <span key={segment} className="relative h-1.5 flex-1 overflow-hidden bg-ink-700">
            {segment <= value && <span data-meter-fill className="absolute inset-0 origin-left bg-accent" />}
          </span>
        ))}
      </span>
    </div>
  );
}

type VibeMetersProps = {
  product: Product;
  className?: string;
  /** Hide seasons and occasions on phones. */
  compact?: boolean;
};

/** Longevity and projection meters plus seasons and occasions. Fills carry [data-meter-fill]. */
export function VibeMeters({ product, className, compact = false }: VibeMetersProps) {
  const labels = brand.copy.worlds.vibe;
  const { vibe } = product;

  return (
    <div className={cn("space-y-3", className)}>
      <Meter label={labels.longevity} value={vibe.longevity} />
      <Meter label={labels.projection} value={vibe.projection} />
      <dl className={cn("grid-cols-2 gap-4 pt-3 text-sm", compact ? "hidden md:grid" : "grid")}>
        <div>
          <dt className="text-micro uppercase text-ivory-muted">{labels.seasons}</dt>
          <dd className="mt-1 capitalize text-ivory">{vibe.seasons.join(", ")}</dd>
        </div>
        <div>
          <dt className="text-micro uppercase text-ivory-muted">{labels.occasions}</dt>
          <dd className="mt-1 capitalize text-ivory">{vibe.occasions.join(", ")}</dd>
        </div>
      </dl>
    </div>
  );
}
