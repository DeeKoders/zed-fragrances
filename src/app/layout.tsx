import type { Metadata, Viewport } from "next";
import "lenis/dist/lenis.css";
import "./globals.css";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CheckoutDialog } from "@/components/cart/CheckoutDialog";
import { Cursor } from "@/components/layout/Cursor";
import { Footer } from "@/components/layout/Footer";
import { GrainOverlay } from "@/components/layout/GrainOverlay";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/layout/PageTransition";
import { Preloader } from "@/components/layout/Preloader";
import { AtmosphereFallback } from "@/components/webgl/Fallback";
import { WebGLLayer } from "@/components/webgl/WebGLLayer";
import { brand } from "@/config/brand";
import { introScript } from "@/lib/intro";
import { getThemeRegistry } from "@/lib/theme/css";
import { MotionProvider } from "@/providers/MotionProvider";
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
  applicationName: brand.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: brand.name,
    title: `${brand.name} | ${brand.taglines.primary}`,
    description: brand.description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  verification: { google: brand.googleSiteVerification },
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
        <script id="zed-intro" dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body className="font-sans text-body">
        <ThemeProvider themes={themes}>
          <MotionProvider>
            <SmoothScroll>
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-ink-950 focus:px-4 focus:py-3 focus:text-label focus:uppercase focus:text-gold-200"
              >
                {brand.copy.skipToContent}
              </a>
              <AtmosphereFallback />
              <WebGLLayer />
              <Header />
              <main id="main" tabIndex={-1} className="outline-none">
                {children}
              </main>
              <Footer />
              <CartDrawer />
              <CheckoutDialog />
              <PageTransition />
              <Preloader />
              <GrainOverlay />
              <Cursor />
            </SmoothScroll>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
