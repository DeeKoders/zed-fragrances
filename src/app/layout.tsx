import type { Metadata, Viewport } from "next";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Footer } from "@/components/layout/Footer";
import { GrainOverlay } from "@/components/layout/GrainOverlay";
import { Header } from "@/components/layout/Header";
import { AtmosphereFallback } from "@/components/webgl/Fallback";
import { brand } from "@/config/brand";
import { getThemeRegistry } from "@/lib/theme/css";
import { SmoothScroll } from "@/providers/SmoothScroll";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { fontVariables } from "./fonts";

export const metadata: Metadata = {
  metadataBase: new URL(brand.siteUrl),
  title: {
    default: `${brand.name} | ${brand.taglines.primary}`,
    template: `%s | ${brand.name}`,
  },
  description: brand.description,
};

export const viewport: Viewport = {
  themeColor: brand.palette.ink["950"],
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const { css, themes } = getThemeRegistry();

  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <style id="zed-theme" dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body className="font-sans text-body">
        <ThemeProvider themes={themes}>
          <SmoothScroll>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-ink-950 focus:px-4 focus:py-3 focus:text-label focus:uppercase focus:text-gold-200"
            >
              Skip to content
            </a>
            <AtmosphereFallback />
            <Header />
            <main id="main" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <Footer />
            <GrainOverlay />
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
