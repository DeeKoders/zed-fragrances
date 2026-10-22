# ZED Fragrances: Website Build Brief

You are building the official website for ZED Fragrances, a luxury "inspired-by" perfume brand. It currently has 2 signature products, SOVEREIGN and DOMINATOR. More will be added later, so products, colors, copy and imagery must all be data-driven.

Brand assets and reference graphics are in `_brand/`. Study every image there before writing any code, because they define the visual language.

---

## 0. Project context (read first)

- Environment: macOS, Node.js installed, npm as the package manager.
- This folder already contains `PROMPT.md` (this file), `_brand/` and an initialized git repo (`.git`). Never delete, move or rename them.
- create-next-app refuses non-empty folders. Scaffold into a temporary folder with git disabled, move the files into this folder, keep the existing `.git`, then delete the temp folder.
- I'm on a Claude Pro plan with usage limits, so work efficiently:
  - plan before coding;
  - keep replies short;
  - don't re-read files you've already read in this session;
  - avoid unnecessary full-repo scans.
- I run the dev server myself (`npm run dev` in a separate terminal). Never start long-running processes. Only run `npm run lint` and `npm run build` to verify your work.
- I handle git myself. Don't run git commands.
- Work strictly phase by phase (see section 8). Stop after each phase and wait for me.

---

## 1. What the reference graphics establish

Files in `_brand/reference/`:
- `sovereign-poster.png`: Sovereign product poster
- `dominator-poster.png`: Dominator product poster
- `duo-banner.png`: both bottles side by side
- `first-batch-poster.png`: "First Batch Ready / Limited Stock" poster

Visual language:
- **Base:** near-black and cinematic, with high-contrast lighting, warm gold bokeh, and reflective black surfaces (wet stone, polished marble).
- **Brand gold:** metallic gold gradient on the ZED wordmark. "F R A G R A N C E S" is set in widely tracked caps. Dividers are thin gold rules with a small diamond in the center.
- **Typography:** classical Roman serif caps (Trajan/Cinzel feel) for names and headings, and wide letter-spacing on all small labels.
- **Each product owns its own "world":**
  - SOVEREIGN (inspired by Baccarat Rouge 540): crimson/ruby + gold. Red marble veins, red velvet, ruby crystals, saffron threads, oud wood, white flower, lotus emblem. Warm.
  - DOMINATOR (inspired by Office for Men): electric/royal blue + gold. Blue lightning cracks, black rock, crowned gold lion emblem, leather, fountain pen, lime, black pepper. Cold.
- **Bottle:** black glass with a tiered black/chrome cap and a black label with a gold border, textured in the product's color.
- **Feature strip:** a recurring row of 4 icons separated by thin gold vertical lines. Labels used: Luxury Scent, Long Lasting, Premium Quality, Rich & Captivating, Bold & Distinctive, For Every Occasion, Confidence in Every Spray, Crafted with Passion.
- **Taglines in use:** "Signature Scents. Distinctive You.", "First Batch Ready", "Premium Quality. Timeless Scents.", "Limited Stock. Grab Yours Before It Ends."

Direction: keep this DNA (black + gold luxury) but push it into a bold, modern, funky, unmistakably current web experience. It must NOT look like a template or a generic Shopify theme. Aim for Awwwards-level energy: kinetic typography, scroll-driven storytelling, a theme that morphs, and tactile micro-interactions everywhere.

---

## 2. Tech stack

- Next.js (App Router), TypeScript (strict), Tailwind CSS
- GSAP + ScrollTrigger for scroll storytelling, Lenis for smooth scrolling
- Framer Motion for UI and component transitions
- React Three Fiber (or raw WebGL shaders) for a lightweight background layer (smoke, particles, light rays) tinted by the active theme. It must be lazy-loaded and have a static fallback.
- culori (or chroma-js) to generate full palettes from a single accent color
- Zustand for the cart (persisted to localStorage)
- Fonts via next/font:
  - Cinzel for display (matches the wordmark)
  - Cormorant Garamond italic for editorial accents
  - A clean modern sans for body and UI, such as Manrope or Space Grotesk

---

## 3. Core rule: everything is dynamic

Create two files:
- `src/config/brand.ts`, containing:
  - brand name, taglines and logo paths;
  - base palette (blacks, golds);
  - social links (placeholders);
  - WhatsApp number (placeholder `923000000000`, international format without "+");
  - currency (default "PKR");
  - drop/announcement banner settings (on/off, text, optional stock meter, optional countdown date);
  - the footer disclaimer.
- `src/data/products.ts`: a typed array of products. Adding a new perfume must require ONLY adding one object here plus its images. No component changes.

Product schema (extend if useful):
```ts
type Product = {
  slug: string;
  name: string;                 // "Sovereign"
  inspiredBy: string;           // "Baccarat Rouge 540"
  tagline: string;
  story: string;                // 2–3 sentence mood description
  gender: "men" | "women" | "unisex";
  concentration: string;        // "Eau de Parfum"
  sizes: { ml: number; price: number; inStock: boolean }[];
  notes: { top: string[]; heart: string[]; base: string[] };
  vibe: {
    longevity: 1 | 2 | 3 | 4 | 5;
    projection: 1 | 2 | 3 | 4 | 5;
    seasons: string[];
    occasions: string[];
    moodTags: string[];
  };
  features: { icon: string; label: string }[];
  emblem: string;               // path to SVG emblem (lotus, lion, ...)
  props: string[];              // ingredient images for parallax layers
  images: { bottle: string; hero: string; poster?: string; gallery: string[] };
  theme: {
    accent: string;             // the ONLY required color, e.g. "#B3122E"
    accentAlt?: string;
    glow?: string;
    texture: "marble-veins" | "lightning" | "smoke" | "silk" | "none";
    mood: "warm" | "cold";
  };
};
```

### Theme engine
- From `theme.accent` (plus optional overrides), auto-generate a full token set: accent scale 50–900, glow, gradient stops, border tint, and text-on-accent with guaranteed WCAG AA contrast.
- Expose all tokens as CSS variables (`--accent`, `--accent-glow`, `--accent-gradient`, etc.), and have Tailwind classes reference those variables.
- No raw hex values inside components.
- A `ThemeProvider` holds the active product theme. The theme changes when the user scrolls into a product section, hovers a product, opens a product page, or gets a scent-finder result.
- On a theme change, the WHOLE site morphs smoothly: background glow, WebGL tint, cursor, buttons, selection color, scrollbar and borders. Use roughly 800ms of eased color interpolation, never a hard swap.
- Gold stays constant as the brand anchor; only accents morph.
- Generate the textures (marble veins, lightning, smoke, silk) procedurally with SVG, canvas or a shader, colored by the theme variables. A future product just picks an accent and a texture and automatically gets its own unique world.

### Seed data
Notes and prices are placeholders; I'll replace them with the real values.
- Sovereign:
  - accent ≈ #B3122E, accentAlt deep wine, warm, texture marble-veins, emblem lotus
  - notes: top saffron; heart jasmine; base amberwood, oud, cedar
  - moodTags: velvet, night, luxurious, magnetic, sweet-warm
  - size 30ml, price 0
- Dominator:
  - accent ≈ #1F4BFF, accentAlt deep navy, cold, texture lightning, emblem crowned lion
  - notes: top lime, black pepper; heart aromatic spices; base woods, leather
  - moodTags: powerful, fresh, office, confident, electric
  - size 30ml, price 0
- A price of 0 renders as "Price on request" until I set real prices.

---

## 4. Pages and sections

### Home (`/`)

1. **Preloader.** The ZED logo reveals in gold. Use an SVG stroke draw-in followed by a gold gradient fill if the logo is SVG, or a gold mask/shine reveal if it's raster. The diamond divider expands, then a curtain reveals the hero. Keep it under 2 seconds and show it once per session.
2. **Hero.** Full screen with a split world: Sovereign's crimson/gold on one side, Dominator's electric blue on the other.
   - Moving the cursor toward one side intensifies that world and dims the other.
   - The seam between the worlds is a living, shader-driven boundary of smoke or energy.
   - Massive kinetic "ZED" typography and the tagline "Signature Scents. Distinctive You."
   - Bottles float and tilt in 3D, following the cursor.
   - When there are more than 2 products, the hero automatically becomes an orbit or carousel.
   - On mobile, the split is vertical (top/bottom) and responds to tap or scroll instead of hover.
3. **Marquee.** An infinite strip in tracked gold caps (LONG LASTING ◆ PREMIUM QUALITY ◆ LUXURY SCENT ◆ …). Its speed reacts to scroll velocity.
4. **Product Worlds.** One pinned, scroll-driven chapter per product, auto-generated from data. As the user scrolls through a chapter:
   - the theme morphs in;
   - the product name goes from outlined to filled in huge type;
   - the bottle rotates and scales at center stage;
   - the ingredient props drift in parallax depth layers;
   - the notes reveal as an animated pyramid (top → heart → base);
   - the longevity and projection meters fill;
   - a CTA appears ("Discover Sovereign" / "Order Now").
5. **Scent Finder.** A playful 3–4 step quiz.
   - Example questions: when you wear it, pick a vibe (velvet night vs electric power), warm or cold.
   - It scores products by their moodTags, seasons and occasions, then reveals the match with a dramatic full-site theme takeover.
   - New products must join the quiz automatically.
6. **Collection.** A grid that scales to many products.
   - Hovering a card makes it adopt that product's theme, tilts the bottle and reveals the notes.
   - Include a side-by-side compare mode.
7. **Drop Banner.** "First Batch Ready / Limited Stock. Grab yours before it ends." Fully controlled from brand config.
8. **Feature Strip.** The 4-icon strip from the graphics, with thin gold vertical dividers. The icons line-draw in when they scroll into view.
9. **Reviews.** Reads from `src/data/reviews.ts` and stays hidden while that file is empty. Never invent testimonials.
10. **Footer.** Logo, socials, WhatsApp, and a newsletter input (UI plus a placeholder handler). Include this disclaimer: "ZED Fragrances is not affiliated with or endorsed by the brands referenced. Names are used for comparison only; all trademarks belong to their respective owners."

### Product page (`/fragrances/[slug]`)

Statically generated from data. It should include:
- a full themed takeover;
- a gallery with zoom;
- a size selector;
- the notes pyramid and vibe meters;
- a "Pairs well with" section showing other products;
- a sticky add-to-bag bar on mobile.

### Ordering

- A cart drawer (Zustand, persisted to localStorage).
- An "Order on WhatsApp" button that builds a prefilled message (items, sizes, quantities, total in the configured currency) and opens `https://wa.me/<number>?text=...`.
- Keep checkout behind an abstraction (e.g. `src/lib/checkout.ts`) so a payment gateway can be plugged in later.

---

## 5. Interaction and motion

- **Custom cursor.** A gold dot plus a ring that takes the active accent color. It grows over interactive elements and shows "VIEW" or "ORDER" labels over bottles and CTAs. Disable it on touch devices.
- **Buttons.** Magnetic, with a gold sheen that sweeps across on hover.
- **Text.** Split-text reveals on headings, and an occasional gold shimmer passing over the wordmark.
- **Atmosphere.** A subtle film grain and vignette overlay across the whole site for a cinematic feel.
- **Route transitions.** A theme-colored ink or wipe transition between pages.
- **Performance.** Animate only transform and opacity, cap the WebGL device pixel ratio, and pause WebGL when it's off-screen or the tab is hidden. Target 60fps.
- **Reduced motion.** Fully respect `prefers-reduced-motion`: static gradients, no pinning, instant theme swaps, no WebGL.

---

## 6. Responsive, performance, SEO, accessibility

- **Mobile-first.** The hero, product chapters and quiz must be designed for phones, not shrunk down. Test widths: 390px, 768px, 1440px.
- **Performance.** Use next/image with AVIF/WebP and lazy-load WebGL and heavy sections. Targets: Lighthouse mobile ≥ 90 performance, ≥ 95 accessibility and SEO.
- **SEO.** Per-product metadata and OG images, JSON-LD Product schema, sitemap and robots.txt.
- **Accessibility.** AA contrast enforced by the theme engine, full keyboard navigation, gold focus states, alt text pulled from data, and semantic landmarks.

---

## 7. Brand assets

### `_brand/logo/`: official ZED logo files
- Use them. Never recreate or redraw the wordmark.
- Copy them into `public/brand/`.
- Generate the favicon, apple-touch-icon and default OG image from them. Use the monogram/icon file for the favicon if one exists.
- If only a raster logo exists, use it as-is. Don't trace it.

### `_brand/emblems/`: official lotus and lion emblems
- If present, copy them into `public/brand/emblems/` and use them.
- If missing, create clean placeholder SVG emblems in the same style (gold, line-based) and list them in the README as "to replace."

### `_brand/reference/`: the 4 reference graphics
- Copy them into `public/images/reference/` and use them as temporary hero, poster and gallery imagery.
- Crop or mask bottles from `sovereign-poster.png` and `dominator-poster.png` as temporary bottle cutouts.
- Do NOT use `first-batch-poster.png` for close-up bottle crops. Its labels contain AI-generated text errors, so use it only as a mood or background image.

### Product folders
- Structure: `public/images/products/<slug>/` (`bottle.png`, `hero.jpg`, `gallery-*.jpg`, `props/*.png`) so I can drop in real transparent bottle cutouts and ingredient PNGs later without touching code.
- Where an asset is missing, use a stylized placeholder. Never block on assets.

### Never
- Never use the original brands' logos, bottles, packaging or imagery.
- Never use stock photos of other perfume brands.

---

## 8. How to work

### Step 1: plan only, no code
Analyze every image in `_brand/` and give me:
- the design direction (palette tokens, type scale, motion principles);
- the folder structure;
- the confirmed phase plan below.

Then wait for my OK.

### Step 2: build one phase at a time
1. Scaffold + theme engine, plus:
   - `brand.ts` and `products.ts` with the seed data;
   - fonts;
   - the layout shell (header, footer, grain overlay);
   - Lenis smooth scrolling;
   - copying the brand assets into `public/`.
2. Hero, in three sub-steps:
   - **2a:** preloader
   - **2b:** split-world hero (layout, cursor interaction, kinetic type, floating bottles) + custom cursor
   - **2c:** WebGL background + shader seam, with static fallback
3. Product worlds, in two sub-steps:
   - **3a:** pinned chapter structure, scroll-driven theme morphing, name reveal, bottle animation
   - **3b:** parallax props, notes pyramid, vibe meters, procedural textures (marble veins, lightning)
4. Scent finder + collection/compare + marquee + drop banner + feature strip + reviews + footer
5. Product page + cart drawer + WhatsApp ordering
6. Polish:
   - page transitions and magnetic buttons;
   - performance pass, accessibility pass, SEO (metadata, OG, JSON-LD, sitemap);
   - the README.

### Rules for every phase
- Before starting, re-read only the sections of this file relevant to that phase.
- When done, run `npm run lint` and `npm run build` and fix every error.
- Then give me a short checklist of what to verify in the browser at 390px, 768px and 1440px.
- Stop and wait. Don't start the next phase on your own.

### README (Phase 6)
It must explain:
- how to add a new product, step by step, with a full example object;
- how to change brand colors, copy, taglines and the drop banner;
- how to set the WhatsApp number and currency;
- where to put real bottle and ingredient images;
- how to deploy to Vercel.