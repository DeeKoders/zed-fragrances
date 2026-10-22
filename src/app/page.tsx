import { DiamondDivider } from "@/components/ui/DiamondDivider";
import { Logo } from "@/components/ui/Logo";
import { brand } from "@/config/brand";
import { ShellPreview } from "@/sections/home/ShellPreview";

// Phase 1 placeholder: the split-world hero and real home sections replace this from Phase 2.
export default function Home() {
  return (
    <>
      <section className="flex min-h-svh flex-col items-center justify-center px-5 pb-16 pt-28 text-center">
        <p className="text-micro uppercase text-gold-400">{brand.taglines.drop}</p>
        <Logo
          href={null}
          eager
          sizes="(min-width: 768px) 36rem, 80vw"
          className="mt-8 w-[min(80vw,36rem)]"
        />
        <h1 className="mt-10 font-display text-h3 uppercase">{brand.taglines.primary}</h1>
        <DiamondDivider className="mt-8 w-48" />
        <p className="mt-8 max-w-md font-editorial text-editorial italic text-ivory-muted">
          {brand.taglines.quality}
        </p>
      </section>
      <ShellPreview />
    </>
  );
}
