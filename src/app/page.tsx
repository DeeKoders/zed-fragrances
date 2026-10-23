import { Collection } from "@/sections/home/collection/Collection";
import { DropBanner } from "@/sections/home/DropBanner";
import { FeatureStrip } from "@/sections/home/FeatureStrip";
import { ScentFinder } from "@/sections/home/finder/ScentFinder";
import { Hero } from "@/sections/home/hero/Hero";
import { Marquee } from "@/sections/home/Marquee";
import { Reviews } from "@/sections/home/Reviews";
import { ProductWorlds } from "@/sections/home/worlds/ProductWorlds";

export default function Home() {
  return (
    <>
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
