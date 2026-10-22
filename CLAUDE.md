Add this section to CLAUDE.md, keep the rest short:

## Project rules
- The full brief is in PROMPT.md. Read the relevant sections when starting a new phase.
- Product data lives only in src/data/products.ts and brand settings only in src/config/brand.ts. Never hardcode product names, colors or copy in components.
- Colors come from the theme engine's CSS variables. No raw hex values in components.
- Gold is the constant brand color; only product accents morph.
- The official logo and emblems are in public/brand/. Never redraw them.
- Every animation must respect prefers-reduced-motion.
- I run the dev server and handle git myself. You only run npm run lint and npm run build.
- A phase isn't done until lint and build both pass.