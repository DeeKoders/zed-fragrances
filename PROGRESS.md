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
| 3b Product worlds: details + textures | next |
| 4 Finder, collection, marquee, banner, strip, reviews, footer | pending |
| 5 Product page, cart, WhatsApp | pending |
| 6 Polish, SEO, README | pending |

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

## Needs review
- WebGL shaders (`Atmosphere.tsx`, `SeamCanvas.tsx`) are untested in a browser; check the console for `[webgl]` warnings.
