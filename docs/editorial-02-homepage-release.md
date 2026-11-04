# Edition 02 / Quiet Luxury — homepage revision

This release changes ONLY the Edition 02 storefront homepage, its visual motion, responsive styling and local demo/editorial photographs. Existing commerce, API, checkout and admin screens are intentionally unchanged.

## Art direction
- A quieter hero with a dominant fashion photograph, less decoration and precise typography.
- Purposeful asymmetrical editorial category gallery and image-first product shelves.
- Cleaner full-bleed campaign and brand-story composition.
- A two-chapter cinematic narrative (desktop scroll pinned; accessible successive chapters on mobile).
- Separate journal photography, fewer promotional decorations and more generous spacing.
- Scoped GSAP, graceful reduced-motion handling and responsive Maison menu transitions.

## Demo photography
Thirteen optimized WebP images are stored under `public/images/editorial`. Their sources, photographers and dimensions are documented in `manifest.json`. These Pexels-licensed photographs are **visual placeholders**, never product claims. Admin-supplied merchant content remains authoritative.

## Release guard
Merge into `main` only after:
1. All 13 local images and manifest exist.
2. `npm test` passes.
3. `npm run typecheck` passes.
4. `npm run build` passes.
5. Vercel production deploy from the tested SHA is READY.

Edition 01, Edition 03 and the shared admin are not modified in this release.
