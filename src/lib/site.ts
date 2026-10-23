import { brand } from "@/config/brand";

/** Absolute URL on the configured site (brand.siteUrl). */
export function absoluteUrl(path: string) {
  return new URL(path, brand.siteUrl).toString();
}
