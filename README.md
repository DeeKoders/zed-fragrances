# ZED Fragrances

The website for ZED Fragrances, a luxury "inspired-by" perfume house. Everything (products, colours, copy, imagery) is data-driven: adding a perfume means adding one object and its images.

**Stack:** Next.js (App Router, TypeScript strict), Tailwind CSS v4, GSAP + ScrollTrigger, Lenis, Motion, raw WebGL shaders, culori (theme engine), Zustand (cart).

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build   # also validates every theme colour and its contrast
```

## Where things live

| What | File |
|---|---|
| Products (the catalogue) | `src/data/products.ts` |
| Brand settings, copy, taglines, drop banner, WhatsApp, currency, delivery and COD fees, wallet account | `src/config/brand.ts` |
| Scent Finder questions | `src/data/quiz.ts` |
| Customer reviews | `src/data/reviews.ts` |
| Checkout (totals, payment methods, placing an order) | `src/lib/checkout.ts`, `src/components/cart/CheckoutDialog.tsx` |
| Order capture (server) | `src/app/api/orders/route.ts` |
| Orders sheet script and setup guide | `google-apps-script/` |
| Admin portal (`/admin`): page, actions, UI, text | `src/app/admin/`, `src/components/admin/`, `src/lib/admin/`, `src/config/admin.ts` |
| Newsletter handler (placeholder) | `src/lib/newsletter.ts` |
| Logo and emblems | `public/brand/` |
| Product images | `public/images/products/<slug>/` |

Components never hardcode product names, colours or copy, and use theme CSS variables instead of hex values.

## Add a new product

1. Pick a slug (lowercase, dashes), e.g. `midnight-oud`. It must be unique and can't be `house`.
2. Create `public/images/products/midnight-oud/` and add:
   - `bottle.png`: transparent bottle cutout, 9:20 portrait (e.g. 540×1200);
   - `hero.jpg`, `gallery-1.jpg`, `gallery-2.jpg`, … for the product page gallery;
   - `props/*.png` (optional): transparent ingredient images for the parallax layers;
   - an emblem SVG in `public/brand/emblems/` (gold line art).
3. Add one object to the `products` array in `src/data/products.ts`:

```ts
{
  slug: "midnight-oud",
  name: "Midnight Oud",
  inspiredBy: "Reference Fragrance Name",
  tagline: "Smoke after dark.",
  story:
    "Two or three sentences of mood. Smoked oud and rose drift over a bed of amber, as quiet and heavy as a velvet curtain.",
  gender: "unisex",                       // "men" | "women" | "unisex"
  concentration: "Eau de Parfum",
  sizes: [
    { ml: 30, price: 4500, inStock: true }, // price 0 shows "Price on request"
    { ml: 50, price: 6500, inStock: false },
  ],
  notes: {
    top: ["Pink Pepper"],
    heart: ["Rose", "Saffron"],
    base: ["Oud", "Amber", "Patchouli"],
  },
  vibe: {
    longevity: 5,                         // 1–5
    projection: 4,                        // 1–5
    seasons: ["autumn", "winter"],
    occasions: ["evening", "date night"],
    moodTags: ["smoky", "night", "luxurious", "magnetic"],
  },
  features: [                             // 4 items; icons: lotus, clock, diamond, leaves, crown, bottle, lion, shield, flame
    { icon: "flame", label: "Rich & Captivating" },
    { icon: "clock", label: "Long Lasting" },
    { icon: "diamond", label: "Premium Quality" },
    { icon: "crown", label: "Bold & Distinctive" },
  ],
  emblem: "/brand/emblems/midnight-oud.svg",
  props: ["/images/products/midnight-oud/props/oud.png"], // [] = placeholder orbs named after the notes
  images: {
    bottle: "/images/products/midnight-oud/bottle.png",
    hero: "/images/products/midnight-oud/hero.jpg",
    gallery: [
      "/images/products/midnight-oud/gallery-1.jpg",
      "/images/products/midnight-oud/gallery-2.jpg",
    ],
    // alt: { bottle: "Custom alt text" },   // optional; sensible defaults are generated
  },
  theme: {
    accent: "#6B2FBF",                    // the only required colour
    accentAlt: "#1E0B3A",                 // optional: deep shade
    glow: "#A774FF",                      // optional: bright highlight
    texture: "smoke",                     // "marble-veins" | "lightning" | "smoke" | "silk" | "none"
    mood: "cold",                         // "warm" | "cold"
  },
  // seo: { title: "…", description: "…" }, // optional overrides
},
```

That's all. The product automatically gets its own themed world (generated from `accent` with guaranteed AA text contrast), a chapter in the scroll story, a place in the Scent Finder, a collection card, a statically generated page at `/fragrances/midnight-oud`, an OG share image, sitemap and JSON-LD entries. With three or more products the hero switches from the split view to an orbit.

The Scent Finder matches answers against `moodTags`, `seasons`, `occasions` and `theme.mood`. Use tags that appear in `src/data/quiz.ts` (or add options there) so new products can win.

## Brand colours, copy, taglines

All in `src/config/brand.ts`:

- `palette`: the blacks, ivory and the gold scale. Gold is the constant brand colour; only product accents morph.
- `houseTheme`: the site's look when no product is active.
- `taglines`: primary (hero), quality, drop, urgency.
- `features`: the brand-wide 4-icon strip.
- `nav`, `socials`, `disclaimer`.
- `copy`: every interface string (buttons, labels, finder text, cart, WhatsApp message, …).

The build fails with a clear message if a colour is invalid, a slug is duplicated or a text colour misses AA contrast.

## Drop banner

`brand.dropBanner` in `src/config/brand.ts`:

```ts
dropBanner: {
  enabled: true,                                   // false hides the section
  eyebrow: "First Batch Ready",                    // big gold headline
  text: "Limited Stock. Grab yours before it ends.",
  stock: { remaining: 18, total: 50 },             // or null to hide the meter
  countdownTo: "2026-12-31T23:59:59+05:00",        // or null to hide the countdown
  image: { src: "/images/reference/first-batch-poster.png", width: 1024, height: 1536 }, // mood background, or null
},
```

## Checkout and orders

**Checkout** in the bag (or **Buy now** on a product page) opens a checkout popup. The customer enters their delivery details and picks one of two payment methods:

- **EasyPaisa / JazzCash**: the next step shows the account number, account title and amount to send, with a field for the payment screenshot. After ordering, the customer is told to wait for confirmation (about 1 working day).
- **Cash on Delivery**: adds the COD charge and places the order straight away.

Every order includes the delivery fee. Orders go to `/api/orders`, which re-prices the bag from the catalogue and records the order in a Google Sheet through Apps Script. Screenshots are saved to Google Drive. **Setup guide: [`google-apps-script/README.md`](google-apps-script/README.md).** It needs two environment variables, `ORDERS_SCRIPT_URL` and `ORDERS_SCRIPT_SECRET` (see `.env.example`).

In `src/config/brand.ts`:

- `checkout.deliveryFee`, `checkout.codFee`: in `currency`.
- `checkout.wallet`: the providers shown, account number and account title.
- `whatsapp`: international format without "+", e.g. `"923001234567"`. Used for the footer link, order questions, and as a fallback if an order can't be placed.
- `currency`: ISO code, e.g. `"PKR"`. `locale` controls number formatting (default `"en-PK"`).
- `copy.checkout`: all checkout text, including the confirmation messages.

### Admin portal

`/admin` is a private, password-protected page (set `ADMIN_PASSWORD`) for handling orders: it lists them from the sheet, shows payment screenshots, and confirms or cancels orders. It isn't linked anywhere, isn't indexed, and renders without the storefront's chrome (`SiteChrome` in the root layout skips the `admin` segment). Its text is in `src/config/admin.ts`, kept out of `brand.ts` so it never ships to visitors. Details: [`google-apps-script/README.md`](google-apps-script/README.md#admin-portal).

To add another payment method later (e.g. a card gateway), add it to `PaymentMethod` in `src/lib/checkout.ts`, give it copy in `brand.copy.checkout`, and handle it in `CheckoutDialog` and the orders route.

## Real images

- **Bottles:** replace `public/images/products/<slug>/bottle.png` with a transparent cutout (9:20 portrait). The current ones are temporary crops from the reference posters.
- **Ingredients:** put transparent PNGs in `public/images/products/<slug>/props/` and list them in the product's `props`. While `props` is empty, stylised orbs named after the notes stand in.
- **Gallery:** add photos and list them in `images.gallery`. The current gallery uses the reference posters.
- **Emblems:** keep the file names in `public/brand/emblems/`.
- **Logo:** `public/brand/zed-logo.png` (official) and `zed-wordmark.png` (crop). `zed-wordmark-alpha.png` is the same wordmark with its black background turned transparent; regenerate it if the logo changes.

Images go through `next/image` (AVIF/WebP), so full-size PNG/JPG sources are fine.

### Placeholders to replace

- `public/brand/emblems/lotus.svg` and `lion-crowned.svg`: placeholder emblems drawn in the brand style, to replace with the official ones.
- Bottle cutouts, gallery and props (see above).
- Notes in `src/data/products.ts` (prices are set; a price of `0` would show "Price on request").
- `whatsapp`, `socials` and `siteUrl` in `src/config/brand.ts`.
- `ORDERS_SCRIPT_URL` and `ORDERS_SCRIPT_SECRET`: orders can't be placed until they're set (see `google-apps-script/README.md`). `ADMIN_PASSWORD` turns on the admin portal.
- `src/lib/newsletter.ts`: connect a provider.
- `src/data/reviews.ts`: the Reviews section stays hidden until real reviews are added. Never invent testimonials.

## Motion and accessibility

Every animation respects `prefers-reduced-motion`: no preloader, pinning, WebGL, custom cursor or page wipes; static gradients and instant theme swaps. Keyboard navigation, gold focus rings, skip link, landmarks, dialog focus traps and alt text from data are built in.

## Deploy to Vercel

1. Push the repository to GitHub (or GitLab/Bitbucket).
2. On [vercel.com](https://vercel.com), choose **Add New → Project** and import the repository. Vercel detects Next.js; keep the defaults (build `npm run build`).
3. Under **Environment Variables**, add `ORDERS_SCRIPT_URL`, `ORDERS_SCRIPT_SECRET` and `ADMIN_PASSWORD` (on Netlify: **Site configuration → Environment variables**).
4. Deploy.
5. Add your domain under **Settings → Domains**, then set `siteUrl` in `src/config/brand.ts` to it (used for canonical URLs, the sitemap, robots.txt and share images) and redeploy.

Every push to the main branch redeploys; other branches get preview URLs.
