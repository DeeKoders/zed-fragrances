import Image from "next/image";
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
};

/**
 * The official ZED wordmark, cropped from the raster logo. It has a baked-in black background, so
 * `mix-blend-screen` drops the black and leaves only the gold on dark surfaces.
 */
export function Logo({ className, sizes, eager = false, href = "/" }: LogoProps) {
  const { src, width, height } = brand.logo.wordmark;
  const image = (
    <Image
      src={src}
      width={width}
      height={height}
      alt={brand.name}
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      className="h-auto w-full mix-blend-screen"
    />
  );

  if (href === null) return <div className={cn("block", className)}>{image}</div>;

  return (
    <Link href={href} className={cn("block", className)}>
      {image}
    </Link>
  );
}
