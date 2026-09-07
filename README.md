# RAPPI SPORTS HUB

Consumer sports catalog for **RAPPI SPORTS HUB**. Tagline: **EQUIP | PERFORM | INSPIRE**.

Dark storefront with neon lime CTAs. Offline fallback is the Joma B2B catalog (~**11,104 SKUs**) with real CDN photos. Unit prices are retail Namibian dollars (**N$**, `price_nad_markup67` = USD×18×1.67). Guest browse and cart are enabled. Checkout is a stub (no real payments).

When `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set, the storefront reads catalog, shipping, and site settings from Supabase (with `/data/products.json` as offline fallback). Orders go through the `place_order` RPC.

Staff use the **admin panel** at `/admin` (same Supabase project as the Expo app). Do not put a native admin in mobile.

This is not a Joma brand clone. Layout and page density follow a professional B2B catalog pattern; branding, copy, and imagery are RAPPI.

## Run locally

```bash
cp .env.example .env.local   # fill Supabase URL + anon key
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

Production build:

```bash
npm run build
npm start
```

## Demo login (storefront)

- Email: `shop@rappi.com`
- Password: `rappi123`
- Or use **Continue as guest** on `/login` to browse and check out without an account.

With Supabase configured, login prefers Auth; orders from `place_order` are also mirrored to browser `localStorage` for Account → Orders.

## Admin panel

1. Create a staff Auth user in Supabase (not the demo customer).
2. Promote: `select public.promote_admin('staff@example.com');` (SQL editor / service role).
3. Sign in at `/admin/login`.

Routes: dashboard, products, orders, customers, content (`site_settings`), shipping. Never ship the service role key to the browser.

Schema source of truth: `supabase/migrations/` (shared with mobile).

## Catalog

Normalized catalog: `/data/products.json` (offline fallback, ~11,104 unique SKUs).  
Hero / listing counts are derived from `catalog.length` — do not hard-code piece counts.

Integrity checks (unique SKUs, NAD sell prices, Joma CDN images, unavailable rows allowed):

```bash
npm run check:catalog
```

Assemble a delivered `products.json.gz` payload:

```bash
npm run catalog:ingest
```

Product photos come from `https://v1.joma-sport.net/…` (allowed in `next.config.ts`). Cards use `imageUrl`; the PDP gallery uses `images`. Unavailable SKUs stay in the catalog with `available: false` / stock 0 and are not given invented prices. Listings paginate at 48 products per page.

Search by product **CODE**, title, or category from the header or `/search`.

## Routes

| Path | Screen |
| --- | --- |
| `/` | Catalog home |
| `/login` | Demo login + guest |
| `/category/[slug]` | Category hub |
| `/shop/[slug]` | Dense product listing + filters |
| `/product/[...code]` | Product detail (sizes, stock, low-stock &lt; 5) |
| `/search` | Search + filters |
| `/cart` | Cart with size/qty |
| `/checkout` | Shipping + `place_order` |
| `/checkout/confirmation` | Order confirmation |
| `/account` | Account home |
| `/account/orders` | Order history |
| `/account/profile` | Profile |
| `/promotions` | Promotions |
| `/admin` | Staff back office |

Top nav branches with stock: Sportswear, Football, Basketball, Netball, Swimming, Rugby, Cricket, Boxing, Hockey, Running & Fitness, Shoes, Balls & Bags.

## Stack

Next.js App Router, TypeScript, Tailwind CSS v4, shadcn-style UI primitives, Zustand (cart / auth / orders), Supabase (`@supabase/ssr`).
