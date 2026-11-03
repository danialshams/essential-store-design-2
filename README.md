# ESSENTIAL / Edition 02 — Editorial Storefront

A premium, RTL, Persian-language **Next.js 16 / React 19 / TypeScript** storefront, built separately from the economical Edition 01. It shares the existing **studio-commerce-admin** catalog and checkout API rather than creating another admin panel or database.

## What is included

- Premium editorial homepage: cinematic hero, responsive category gallery, curated product collections, magazine-style campaign, brand story, more products, journal and footer.
- **Local demo photos** (optimized WebP) for the hero, fashion portrait, bag editorial and original product examples, included under `public/images`.
- GSAP + ScrollTrigger reveals using opacity/transform, staggered product/category cards, subtle desktop image parallax, reduced-motion support and cleanup on unmount.
- Complete store routes inherited from the shared working commerce base: category pages, product variants, inventory information, product search/filtering, cart, checkout, order success, account demo, articles, information and legal pages.
- An existing authenticated server-to-server checkout relay to the admin API; **no shared key in browser JavaScript**.
- Responsive desktop/tablet/mobile navigation with a mobile drawer and a single on-demand search panel (16px input font to prevent iOS focus zoom).
- Fallback demonstration mode if no admin API is configured. Demo checkout stores examples in the browser only; no fake payment is made.

## Installation

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. For an isolated production build:

```bash
npm test
npm run typecheck
npm run build
npm run start
```

### Connect to the existing admin

Create `.env.local` (not committed):

```env
STOREFRONT_ADMIN_ORIGIN=https://studio-commerce-admin.vercel.app
STOREFRONT_API_SECRET=your-32+-character-server-to-server-key
```

The secret **must be identical to** the `STORE_API_SECRET` value in the admin's server environment. Neither secret uses a `NEXT_PUBLIC_` prefix. All values can be injected by Vercel environment settings later. Do not paste a live secret into a public GitHub repository or a support chat.

The admin's `/api/store/bootstrap` returns active products, variants, categories, banners, pages, articles, shipping options, approved reviews and public store settings. Products/prices/stock remain sourced from the admin. The storefront forwards completed checkout requests to `/api/store/order` with a server-only shared secret. The admin recalculates totals on the server and records orders as **PENDING**; no payment gateway is enabled.

**Important:** This is a second frontend theme, not a new admin product. The existing admin already has a `design-2` theme choice and `homeSections` content fields. This frontend uses the image/title/description/ordering of those sections, the store brand, and the banner/article/category APIs. Extra per-device picture fields and advanced color-picker controls would require a separate admin schema/UI enhancement before they can be advertised as editable.

## How sections are managed

| Homepage content | Admin source |
|---|---|
| Store name, SEO title, description, logo, contact info | Store settings |
| Hero title, text and image (first active section) | Store settings `homeSections` |
| Fashion editorial story (second active section) | Store settings `homeSections` |
| Additional image/text editorial sections | Additional enabled `homeSections` by `position` |
| Promotional collection | First active banner |
| Other promotional campaigns | Remaining active banners |
| Category blocks | Category list and category image |
| Product grids, prices, variants and stock | Products |
| Journal | Published articles |
| Product details and approved feedback | Products / reviews |
| Shipping prices and methods on checkout | Shipping methods |
| Orders and customer address | Server-to-server order endpoint |

Editable images from the admin take precedence; when an optional image is absent, bundled editorial demo photos are used. **Existing demo files are never deleted during a normal content update.**

## Deploying to a customer's VPS later

The app is a standard Next.js Node server and does not require Vercel. Run `npm run build` and `npm run start` under a process manager or Docker in the customer's environment. Point `STOREFRONT_ADMIN_ORIGIN` at that customer's own admin domain, configure a unique secret, and use a customer-specific PostgreSQL database for the admin app. Configure HTTPS, backups and payment provider before taking actual payments.

## Image usage

The demo lookbook and portrait images are **generated for this template**. They are mock content, not actual inventory items; replace photography/text for a client's brand and products. The original demo product images are included solely to keep the template usable offline.

## QA and caveats

`npm test` validates project shape, image assets, admin API contracts, no client-side secret, editorial content wiring and animation conventions. Next.js runtime/visual E2E tests require a dependency install; the project has not been connected to a new GitHub/Vercel project until the owner provides its URL.
