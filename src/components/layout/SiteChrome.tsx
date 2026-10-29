"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import type { ReactNode } from "react";
import { ADMIN_SEGMENT } from "@/lib/routes";

/**
 * Storefront-only parts of the root layout (header, footer, bag, preloader, atmosphere, cursor, …).
 * They render on every page except the admin portal, which stays separate from what visitors see.
 * Without the preloader the intro never finishes there, so smooth scrolling stays off too.
 */
export function SiteChrome({ children }: { children: ReactNode }) {
  return useSelectedLayoutSegment() === ADMIN_SEGMENT ? null : children;
}
