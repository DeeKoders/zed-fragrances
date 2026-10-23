import Image from "next/image";
import Link from "next/link";
import { Texture } from "@/components/textures/Texture";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { productHref } from "@/lib/routes";
import type { Product } from "@/types/product";

/** a: top on phones, left from md. b: bottom, then right. center: the whole hero (orbit). */
export type Side = "a" | "b" | "center";

/** The half of the hero a world's content lives in. */
export function halfBox(side: Side) {
  if (side === "a") return "absolute inset-x-0 top-0 h-1/2 md:inset-y-0 md:right-auto md:h-full md:w-1/2";
  if (side === "b") return "absolute inset-x-0 bottom-0 h-1/2 md:inset-y-0 md:left-auto md:h-full md:w-1/2";
  return "absolute inset-0";
}

/** Bokeh layout as % of the half (mirrored for b), size in vmin, timing in seconds. */
const BOKEH = [
  { x: 14, y: 20, size: 9, duration: 14, delay: -2 },
  { x: 70, y: 14, size: 5, duration: 11, delay: -6 },
  { x: 86, y: 56, size: 12, duration: 17, delay: -4 },
  { x: 28, y: 76, size: 7, duration: 13, delay: -9 },
  { x: 52, y: 38, size: 4, duration: 10, delay: -3 },
  { x: 6, y: 50, size: 6, duration: 15, delay: -7 },
  { x: 62, y: 88, size: 10, duration: 19, delay: -11 },
] as const;

type WorldBackdropProps = { product: Product; side: Side; className?: string };

/**
 * A product's world: accent gradient and glow, its procedural texture, drifting bokeh (gold when
 * warm, icy when cold) and its emblem as a watermark. Themed locally, so it shows its own accent whatever
 * the site theme is. [data-world-glow] and [data-world-dim] are driven by the hero.
 */
export function WorldBackdrop({ product, side, className }: WorldBackdropProps) {
  const mirror = side === "b";

  return (
    <div
      aria-hidden
      data-theme={product.slug}
      data-world={side}
      data-mood={product.theme.mood}
      className={cn("world absolute inset-0 overflow-hidden bg-ink-950", className)}
    >
      <div className="world-base absolute inset-0" />
      <Texture kind={product.theme.texture} seed={product.slug} />
      <div data-world-glow className="world-glow absolute inset-0" />
      <div className={halfBox(side)}>
        <Image
          src={product.emblem}
          alt=""
          width={120}
          height={120}
          unoptimized
          className="absolute left-1/2 top-1/2 h-[68%] max-h-[34rem] w-auto -translate-1/2 opacity-[0.07]"
        />
        <div className="absolute inset-0">
          {BOKEH.map((bokeh, index) => (
            <span
              key={index}
              className="bokeh absolute rounded-full"
              style={{
                left: `${mirror ? 100 - bokeh.x : bokeh.x}%`,
                top: `${bokeh.y}%`,
                width: `${bokeh.size}vmin`,
                height: `${bokeh.size}vmin`,
                animationDuration: `${bokeh.duration}s`,
                animationDelay: `${bokeh.delay}s`,
              }}
            />
          ))}
        </div>
      </div>
      <div data-world-dim className="absolute inset-0 bg-ink-950 opacity-0" />
    </div>
  );
}

const ctaClass =
  "inline-flex items-center gap-3 border border-accent-border px-5 py-3.5 text-label uppercase text-ivory transition-colors duration-500 hover:border-accent hover:bg-accent hover:text-on-accent focus-visible:bg-accent focus-visible:text-on-accent";

type WorldCopyProps = {
  product: Product;
  className?: string;
  /** Part of the hero entrance. Off for copy that remounts (orbit slides). */
  enter?: boolean;
};

/** Reference, name, tagline and call to action for one product. */
export function WorldCopy({ product, className, enter = true }: WorldCopyProps) {
  const rise = enter ? "rise" : undefined;

  return (
    <div data-theme={product.slug} className={className}>
      <p data-enter={rise} className="text-micro uppercase text-accent-ink">
        {brand.copy.inspiredBy} {product.inspiredBy}
      </p>
      <h2 data-enter={rise} className="mt-3 font-display text-h3 uppercase md:text-h2">
        {product.name}
      </h2>
      <p data-enter={rise} className="mt-2 font-editorial text-editorial italic text-ivory-muted">
        {product.tagline}
      </p>
      <div data-enter={rise} className="mt-5 md:mt-7">
        <Link href={productHref(product.slug)} data-cursor="view" className={ctaClass}>
          {brand.copy.hero.cta}
          <span className="sr-only md:not-sr-only">{` ${product.name}`}</span>
          <span aria-hidden className="size-1.5 rotate-45 bg-gold-300" />
        </Link>
      </div>
    </div>
  );
}
