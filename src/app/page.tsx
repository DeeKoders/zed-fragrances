import { brand } from "@/config/brand";
import { absoluteUrl } from "@/lib/site";
import { Collection } from "@/sections/home/collection/Collection";
import { DropBanner } from "@/sections/home/DropBanner";
import { FeatureStrip } from "@/sections/home/FeatureStrip";
import { ScentFinder } from "@/sections/home/finder/ScentFinder";
import { Hero } from "@/sections/home/hero/Hero";
import { Marquee } from "@/sections/home/Marquee";
import { Reviews } from "@/sections/home/Reviews";
import { ProductWorlds } from "@/sections/home/worlds/ProductWorlds";

export default function Home() {
  // WebSite + Organization let Google show the brand name and logo for brand searches.
  const organizationId = absoluteUrl("/#organization");
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: brand.name,
        alternateName: brand.shortName,
        url: absoluteUrl("/"),
        logo: absoluteUrl(brand.logo.full.src),
        description: brand.description,
        contactPoint: { "@type": "ContactPoint", telephone: `+${brand.whatsapp}`, contactType: "customer service" },
      },
      {
        "@type": "WebSite",
        name: brand.name,
        alternateName: brand.shortName,
        url: absoluteUrl("/"),
        publisher: { "@id": organizationId },
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Hero />
      <Marquee />
      <ProductWorlds />
      <ScentFinder />
      <Collection />
      <DropBanner />
      <FeatureStrip />
      <Reviews />
    </>
  );
}
