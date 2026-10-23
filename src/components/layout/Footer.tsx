import Link from "next/link";
import { DiamondDivider } from "@/components/ui/DiamondDivider";
import { Logo } from "@/components/ui/Logo";
import { brand } from "@/config/brand";
import { products } from "@/data/products";
import { whatsappUrl } from "@/lib/whatsapp";
import { CurrentYear } from "./CurrentYear";

const externalLinkClass = "text-body text-ivory transition-colors hover:text-gold-200";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink-950/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-12 md:px-10 md:py-24">
        <div className="md:col-span-5">
          <Logo sizes="160px" className="w-36 md:w-40" />
          <p className="mt-6 max-w-xs font-editorial text-editorial italic text-ivory-muted">
            {brand.taglines.primary}
          </p>
        </div>

        <nav aria-labelledby="footer-fragrances" className="md:col-span-3">
          <h2 id="footer-fragrances" className="text-label uppercase text-gold-400">
            Fragrances
          </h2>
          <ul className="mt-6 space-y-5">
            {products.map((product) => (
              <li key={product.slug}>
                <Link href={`/fragrances/${product.slug}`} className="group block">
                  <span className="font-display text-xl uppercase tracking-[0.12em] text-ivory transition-colors group-hover:text-gold-200">
                    {product.name}
                  </span>
                  <span className="mt-1 block text-sm text-ivory-muted">{brand.copy.inspiredBy} {product.inspiredBy}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className="text-label uppercase text-gold-400">Connect</h2>
          <ul className="mt-6 space-y-3">
            <li>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className={externalLinkClass}>
                WhatsApp <span className="text-ivory-muted">+{brand.whatsapp}</span>
              </a>
            </li>
            {brand.socials.map((social) => (
              <li key={social.label}>
                <a href={social.href} target="_blank" rel="noopener noreferrer" className={externalLinkClass}>
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-12 md:px-10">
        <DiamondDivider />
        <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-ivory-muted">
          {brand.disclaimer}
        </p>
        <p className="mt-6 text-center text-micro uppercase text-ivory-muted">
          © <CurrentYear /> {brand.name}
        </p>
      </div>
    </footer>
  );
}
