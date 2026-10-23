import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { brand } from "@/config/brand";
import { getProduct, products } from "@/data/products";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = brand.name;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

/** Images inlined as data URLs. Cached so the route prerenders at build, where public/ is on disk. */
async function dataUrl(publicPath: string) {
  "use cache";
  const file = await readFile(join(process.cwd(), "public", publicPath));
  return `data:image/png;base64,${file.toString("base64")}`;
}

/** Per-product share image: the product's accent world, its name and the bottle. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  const { palette, logo } = brand;
  if (!product) return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", background: palette.ink["950"] }} />, size);

  const [bottle, wordmark] = await Promise.all([dataUrl(product.images.bottle), dataUrl(logo.wordmark.src)]);
  const accent = product.theme.accent;
  const deep = product.theme.accentAlt ?? palette.ink["900"];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          color: palette.ivory,
          backgroundColor: palette.ink["950"],
          backgroundImage: `radial-gradient(circle at 78% 55%, ${accent} 0%, ${deep} 38%, ${palette.ink["950"]} 75%)`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 700, padding: "0 72px" }}>
          <img src={wordmark} width={220} height={107} alt="" />
          <div style={{ marginTop: 48, fontSize: 24, letterSpacing: 8, textTransform: "uppercase", color: palette.gold["400"] }}>
            {`${brand.copy.inspiredBy} ${product.inspiredBy}`}
          </div>
          <div style={{ marginTop: 12, fontSize: 112, letterSpacing: 8, textTransform: "uppercase", lineHeight: 1 }}>
            {product.name}
          </div>
          <div style={{ marginTop: 20, fontSize: 32, color: palette.ivoryMuted }}>{product.tagline}</div>
        </div>
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
          <img src={bottle} width={243} height={540} alt="" />
        </div>
      </div>
    ),
    size,
  );
}
