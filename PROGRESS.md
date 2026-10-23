# ZED Fragrances: build progress

## Run rules (override PROMPT.md sections 0 and 8 and CLAUDE.md where they conflict)

Plan approved. Permission to build ALL remaining phases in one continuous run: 2b, 2c, 3a, 3b, 4, 5, 6.

1. Don't stop or wait between phases. Go straight from one phase to the next.
2. Before each new phase, write a short plan for it (5–10 bullets) in PROGRESS.md and start building immediately. Don't wait for approval.
3. After each phase:
   - run npm run lint and npm run build, and fix every error;
   - commit with "git add ." and then git commit -m "Phase X: <name>" as two separate commands;
   - update PROGRESS.md with: phase done, browser checklist for that phase, known issues, next phase.
4. If a problem isn't solved after 2 attempts, use the simplest approach that still matches the brief, log it in PROGRESS.md under "Needs review", and keep going. Never stall.
5. Don't cut scope to finish faster. Every section in PROMPT.md section 4 must be built.
6. Never start the dev server. Never delete or move _brand/, PROMPT.md, PROGRESS.md or .git.
7. Keep messages minimal. Work, don't narrate.
8. If context gets long, rely on PROGRESS.md, CLAUDE.md and the code instead of re-reading everything.
9. When Phase 6 is done, give me one combined browser checklist for the whole site and the full "Needs review" list.

---

## Status

| Phase | State |
|---|---|
| 1 Scaffold + theme engine | done (4d5b8a3) |
| 2a Preloader | done |
| 2b Split-world hero + cursor | done |
| 2c WebGL background + seam | done |
| 3a Product worlds: chapters | done |
| 3b Product worlds: details + textures | done |
| 4 Finder, collection, marquee, banner, strip, reviews, footer | done |
| 5 Product page, cart, WhatsApp | done |
| 6 Polish, SEO, README | done |

### Phase 2a + 2b (committed together)
- Preloader: CSS gold mask reveal + shine + diamond rule + curtain, once per tab session, skipped for reduced motion. `src/components/layout/Preloader.tsx`, `src/lib/intro.ts`, `src/stores/intro.ts`.
- Split-world hero (`src/sections/home/hero/`), orbit for 1 or 3+ products, floating bottles, kinetic ZED, custom cursor (`src/components/layout/Cursor.tsx`).
- Header logo uses `public/brand/zed-wordmark-alpha.png` (official wordmark, black turned transparent).
- `.claude/settings.local.json` added to .gitignore (personal settings).

Browser checklist (390 / 768 / 1440):
- First visit in a new tab: preloader under 2s; reload in the same tab skips it.
- Hero: cursor toward a side widens it and morphs the site theme; tap on phones; keyboard focus on a CTA does the same.
- Bottles tilt, letters drift, glint passes over ZED; reduced motion = still 50/50, native cursor.
- Header logo has no black box over the worlds.

### Phase 2c: WebGL background + shader seam
Plan: raw WebGL (no three.js) full-screen fragment shaders; site-wide atmosphere (smoke, rays, dust) tinted by the active theme with an 800ms colour morph; shader seam in the split hero driven by the live balance; lazy-loaded after the intro when idle; static fallbacks (CSS glow, CSS seam line) stay underneath; DPR capped, pauses in hidden tabs, off-screen, or while the opaque hero fills the screen; no WebGL for reduced motion.

Done:
- `src/lib/webgl.ts` (shader layer + loop helpers), `src/components/webgl/Atmosphere.tsx`, `SeamCanvas.tsx`, lazy wrappers `WebGLLayer.tsx` / `SeamLayer.tsx`, `src/hooks/useWebGLReady.ts`, `src/hooks/useAtmosphereCover.ts`, `src/stores/atmosphere.ts`.

Browser checklist:
- A second or so after the intro, the hero seam turns into a wandering gold line with each world's glow on its side, smoke and sparks; it brightens as one world wins and follows the seam (vertical on desktop, horizontal on phones).
- Below the hero, the background shows faint smoke, light rays and dust; it morphs colour when the theme changes (hover the theme demo cards).
- Reduced motion or no WebGL: CSS seam line and static glow only.
- DevTools Performance: no long tasks from the canvas; it stops in a background tab.

Known issues: shaders were not compiled in a real browser during the build (no browser in this run). If a shader fails, the layer logs a `[webgl]` warning and the static fallback stays.

### Phase 3a: product worlds, chapter structure (plan)
- `src/sections/home/worlds/ProductWorlds.tsx` (#worlds) maps `products` to one `Chapter` each; replaces the Phase 1 ShellPreview.
- Each chapter: locally themed stage (reuses the hero's WorldBackdrop), pinned with ScrollTrigger for ~200% (150% on phones), scrubbed timeline.
- Theme: each chapter calls setTheme(slug) while it's in the middle of the viewport; leaving the section returns to the house theme.
- Name: huge outlined type that fills left→right with the accent (counter-translated window, transform only).
- Bottle: centre stage, rotates in Y and scales through the scroll, then eases out.
- Chapter index, "Inspired by", story; slots for 3b (props, notes, meters, texture, CTA).
- gsap.matchMedia: reduced motion = no pin, no scrub, everything visible and filled; theme still switches.
- Refresh ScrollTrigger once the intro releases the scroll lock.

Done: `src/sections/home/worlds/ProductWorlds.tsx`, `Chapter.tsx`; ShellPreview removed; `brand.copy.worlds`; `text-outline` / `text-accent-fill` utilities.

Browser checklist:
- Scrolling past the hero, each chapter pins (about two screens on desktop, 1.5 on phones); the site theme switches to that product as it reaches the middle and back to gold after the last one.
- The huge name fills from gold outline to the accent colour left to right; the bottle turns from the side to face you, then turns away; index, "Inspired by" and story fade in.
- Phones: name in the top third, bottle centred, story at the bottom with no overlap.
- Reduced motion: no pinning, names already filled, theme still switches.
- Header nav "Fragrances" jumps to the chapters.

Known issues: none.

### Phase 3b: product worlds, details + textures (plan)
- Procedural textures (`src/lib/texture.ts` + `src/components/textures/Texture.tsx`): marble veins (smoothed random walks with branches), lightning (midpoint-displacement bolts with flicker), smoke (drifting soft blobs), silk (flowing ribbons). Seeded by slug, arithmetic only (no trig), so server and client render identical SVG; vector strokes, no SVG filters; coloured by theme variables.
- Every WorldBackdrop gets its product's texture, so hero, chapters and later the product page share one world.
- Ingredient parallax: `product.props` images in three depth layers, or stylised note "orbs" (placeholders) when props are empty; scrubbed at different speeds.
- Reusable `NotesPyramid` (top → heart → base) and `VibeMeters` (longevity/projection 5-segment meters, seasons, occasions) in `src/components/product/`.
- Chapter panel with pyramid, meters and CTAs ("Discover X" / "Order Now"); desktop shows it beside the story, phones/tablets swap story → panel while the bottle lifts.
- Timeline: tiers reveal in order, meters fill, CTAs appear last; reduced motion shows the panel in normal flow below the chapter.

Done: `src/lib/texture.ts`, `src/components/textures/Texture.tsx`, `src/components/product/{IngredientLayers,NotesPyramid,VibeMeters}.tsx`, `src/sections/home/worlds/ChapterOrder.tsx`; textures added to every WorldBackdrop (hero + chapters).

Browser checklist:
- Sovereign's world (hero left/top and its chapter) shows thin crimson marble veins; Dominator's shows blue lightning bolts that flicker now and then.
- In a chapter, note orbs (Saffron, Jasmine, …) drift at three depths as you scroll.
- Desktop (≥1024): story bottom-left, panel bottom-right; tiers appear top → heart → base, meter segments fill, then "Discover Sovereign" and "Order Now".
- Phones/tablets: the story fades, the bottle lifts and shrinks into the top area, the panel rises from the bottom; nothing overlaps at 390×844 and 768×1024.
- Reduced motion: panel sits below each chapter in normal flow, all filled.

Known issues: "Order Now" links to the product page until the cart lands in Phase 5. Ingredient props are placeholder orbs until real PNGs are added to `props`.

### Phase 4: finder, collection, marquee, banner, strip, reviews, footer (plan)
- Marquee: infinite strip of gold tracked caps (feature labels from data), seamless loop on the GSAP ticker, speed and direction follow scroll velocity; static for reduced motion.
- Scent Finder (#finder): 4 steps defined in `src/data/quiz.ts`; `src/lib/scent-finder.ts` scores every product by moodTags, seasons, occasions and mood (new products join automatically); result = full-site theme takeover with an accent burst, match %, bottle, notes and CTAs; focus management + live region.
- Collection (#collection): responsive grid that scales to many products; hover/focus previews the product's theme, tilts the bottle and reveals notes; compare mode (pick up to 3) shows a side-by-side table.
- Drop banner: fully driven by `brand.dropBanner` (on/off, eyebrow, text, optional stock meter, optional countdown); first-batch poster as a darkened mood background only.
- Feature strip: 4 icons from `brand.features` with thin gold dividers; icons line-draw in when scrolled into view. Shared line-icon set for all FeatureIcon keys.
- Reviews: `src/data/reviews.ts` (empty) → section hidden until filled. No invented testimonials.
- Footer: newsletter form (UI + placeholder handler in `src/lib/newsletter.ts`), copy moved into `brand.copy`.
- `src/lib/format.ts` price formatting (0 → "Price on request").

Done: `src/sections/home/{Marquee,DropBanner,FeatureStrip,Reviews}.tsx`, `finder/ScentFinder.tsx`, `collection/{Collection,CollectionCard,CompareTable}.tsx`, `src/data/{quiz,reviews}.ts`, `src/lib/{scent-finder,format,newsletter}.ts`, `src/components/ui/FeatureIcon.tsx`, `src/components/layout/NewsletterForm.tsx`, `src/providers/MotionProvider.tsx`, `src/hooks/useNow.ts`; all interface copy in `brand.copy`; `brand.features`; `dropBanner.image`.

Home order: Hero → Marquee → Worlds → Scent Finder → Collection → Drop Banner → Feature Strip → Reviews (hidden) → Footer.

Browser checklist:
- Marquee: two rows (gold, outline) drift in opposite directions; scrolling speeds them up and flips direction with the scroll.
- Scent Finder: Begin → 4 steps with a progress bar, Back works, focus moves to each question; the last choice fires an accent burst from the click point and the whole site morphs to the match; result shows match %, bottle, notes, Discover / Order Now / Start again.
- Collection: hovering a card switches the site theme, tilts its bottle and slides up the notes; on touch the notes show as a line under the tagline. Compare → tick two → table appears below (scrolls sideways on phones).
- Drop banner: big gold "First Batch Ready" over the darkened poster; set `stock` / `countdownTo` in brand.ts to see the meter / timer; `enabled: false` hides it.
- Feature strip: 4 icons draw themselves in, thin gold dividers (2×2 on phones).
- Reviews section is absent (no reviews yet).
- Footer: newsletter accepts an email and shows the success message; invalid email shows the error.

Known issues: newsletter handler is a placeholder (no provider). Marquee labels come from product + brand feature labels.

### Phase 5: product page, cart drawer, WhatsApp ordering (plan)
- `src/stores/cart.ts`: Zustand cart (slug, ml, quantity) persisted to localStorage, rehydrated after mount so SSR markup matches; drawer open state not persisted.
- `src/lib/checkout.ts`: order builder (lines, totals, price-on-request flags) + a pluggable provider interface; the WhatsApp provider builds the prefilled message (items, sizes, quantities, total in the configured currency) and opens `https://wa.me/<number>?text=…`.
- Cart drawer (Motion): slide-in, Esc/overlay close, focus trap, scroll lock, qty steppers, remove, subtotal, "Order on WhatsApp", empty state. Header bag button opens it with a live count.
- `AddToBag` everywhere: chapter/finder "Order Now" adds the default size and opens the drawer.
- `/fragrances/[slug]`: statically generated from data with per-product metadata; full theme takeover; world hero with tilting bottle; size selector; gallery with zoom lightbox; notes pyramid + vibe meters; product features strip; "Pairs well with"; sticky add-to-bag bar on phones.
- All new copy in `brand.copy`.

Done: `src/stores/cart.ts`, `src/lib/checkout.ts`, `src/components/cart/{CartDrawer,CartButton,AddToBag}.tsx`, `src/hooks/useDialog.ts`, `src/components/ui/Lightbox.tsx`, `src/app/fragrances/[slug]/page.tsx`, `src/sections/product/{ProductView,ProductGallery,SizeSelector}.tsx`. Chapter/finder "Order Now" now adds to the bag.

Browser checklist:
- `/fragrances/sovereign` and `/fragrances/dominator` load (statically generated); the whole site turns to that product's colours; going back home returns to gold.
- Bottle tilts with the pointer; size tiles select (keyboard: arrow keys); price shows "Price on request" while 0.
- "Add to bag" opens the drawer with the item; header badge counts it; qty −/+ and Remove work; reload keeps the bag.
- Drawer: Esc / overlay / ✕ closes; Tab stays inside; page doesn't scroll behind it.
- "Order on WhatsApp" (drawer and product page) opens wa.me with items, sizes, quantities and total (PKR) prefilled.
- Gallery: images open in a lightbox; click zooms and follows the pointer; ←/→ and Esc work.
- "Pairs well with" shows the other product's card.
- Phones: after scrolling past the main buttons, a sticky bar with name, size/price and Add to bag slides up.
- Home: "Order Now" in a chapter / finder result adds the default size and opens the drawer.

Known issues: WhatsApp number is the placeholder 923000000000. Checkout keeps the bag after opening WhatsApp (intentional).

### Phase 6: polish, performance, accessibility, SEO, README (plan)
- Route transitions: theme-coloured ink wipe (cover → navigate → reveal) by intercepting internal link clicks; off for reduced motion; failsafe reveal.
- Magnetic CTAs (Motion springs, fine pointers only) and a gold sheen sweep on hover (transform only).
- Split-text reveals on section headings (`SplitHeading`), occasional gold shimmer over the header wordmark.
- Accessibility: remaining hardcoded UI strings (header menu, nav labels) into `brand.copy`; check landmarks, focus, dialogs, reduced motion.
- Performance: confirm image sizes/formats, lazy WebGL, no layout-property animations, idle loops paused off-screen.
- SEO: default OG image generated from the official logo, per-product OG images (`opengraph-image.tsx`), JSON-LD Product schema, `sitemap.ts`, `robots.ts`, canonical URLs, Twitter cards.
- README: add a product (full example), brand colours/copy/taglines/drop banner, WhatsApp + currency, real images, Vercel deploy, placeholder emblems to replace.

Done: `src/components/layout/PageTransition.tsx`, `src/components/motion/{Magnetic,SplitHeading}.tsx`, `.sheen` buttons, header logo shimmer, header strings in `brand.copy.nav`; `src/app/{sitemap,robots}.ts`, `src/app/opengraph-image.png` (from the official logo), `src/app/fragrances/[slug]/opengraph-image.tsx` (prerendered), JSON-LD Product on product pages, canonical + Open Graph + Twitter metadata, `src/lib/site.ts`; README rewritten.

Browser checklist:
- Clicking between home and a product page: accent ink wipes up, the new page appears under it at the top, ink lifts; back/forward navigate normally.
- Main CTAs lean toward the cursor and a gold sheen sweeps across on hover.
- Section headings (finder, collection, product details, pairs) rise word by word when scrolled into view.
- Header logo catches a gold glint every ~9 seconds.
- `/sitemap.xml`, `/robots.txt`, `/opengraph-image.png`, `/fragrances/sovereign/opengraph-image` respond; product page source contains `application/ld+json`.
- Lighthouse (mobile) on `/` and a product page.

Known issues: see Needs review.

## Run complete
All phases built, linted, built and committed.

## Needs review
- Fixed after the run: in dev (React Strict Mode) the WebGL layers forced a context loss on cleanup, then remounted onto the same dead context, which showed as a white canvas over the hero and page plus four `[webgl] null` warnings. `destroy()` no longer forces a loss, the support probe releases its own context, and canvases hide on `webglcontextlost`. Re-check the hero seam and background in the browser.
- Nothing was viewed in a browser during this run (no dev server allowed): every layout, especially phones (390×844 and a short 375×667) in the pinned chapters, where the bottle-lift values were tuned by calculation.
- Lighthouse scores (targets: mobile ≥90 performance, ≥95 accessibility/SEO) were not measured.
- Procedural textures are rendered on the server and hydrated; they use arithmetic only so all engines should match, but check Safari's console for hydration warnings.
- Feature-strip icons draw in by animating `stroke-dashoffset` (a paint property, not transform/opacity), as the brief asks for a line-draw; small icons only.
- Product OG images use the default sans font (Cinzel isn't embedded in the image renderer).
- Scent Finder "match %" is the honest share of matched tags, so mixed answers can show modest numbers.
- Page transitions intercept internal link clicks globally; browser back/forward isn't animated.
- Placeholder content: emblems (`lotus.svg`, `lion-crowned.svg`), ingredient props (orbs), bottle crops and gallery (reference posters), prices (0), WhatsApp number, socials, `siteUrl`, newsletter handler.
