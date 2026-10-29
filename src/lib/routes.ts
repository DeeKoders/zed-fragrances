/** First URL segment of the admin portal (src/app/admin). The storefront's chrome and intro skip it. */
export const ADMIN_SEGMENT = "admin";

/** Product page URL. The page itself ships in Phase 5. */
export function productHref(slug: string) {
  return `/fragrances/${slug}`;
}
