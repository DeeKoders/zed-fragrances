import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
  sizes: string;
  /** Load immediately (above-the-fold usage). */
  eager?: boolean;
  /** Link target; null renders the logo without a link. */
  href?: string | null;
  /** An occasional gold glint across the letters (clipped to the logo's alpha). */
  shimmer?: boolean;
};

/** The official ZED wordmark (transparent version of the raster logo), so it sits cleanly on any world. */
export function Logo({ className, sizes, eager = false, href = "/", shimmer = false }: LogoProps) {
  const { src, width, height } = brand.logo.wordmark;
  const mask = shimmer ? getImageProps({ src, width: 160, height: Math.round((160 * height) / width), alt: "" }).props.src : null;
  const image = (
    <>
      <Image
        src={src}
        width={width}
        height={height}
        alt={brand.name}
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        className="h-auto w-full"
      />
      {mask && (
        <span aria-hidden className="logo-shimmer absolute inset-0" style={{ maskImage: `url("${mask}")` }}>
          <span className="logo-shimmer-band absolute inset-y-0 left-0 w-1/3" />
        </span>
      )}
    </>
  );

  if (href === null) return <div className={cn("relative block", className)}>{image}</div>;

  return (
    <Link href={href} aria-label={brand.copy.nav.home} className={cn("relative block", className)}>
      {image}
    </Link>
  );
}
