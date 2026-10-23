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
| 2c WebGL background + seam | next |
| 3a Product worlds: chapters | pending |
| 3b Product worlds: details + textures | pending |
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

## Needs review
- (none yet)
