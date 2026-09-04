# RAPPI SPORTS HUB

Consumer sports catalog for **RAPPI SPORTS HUB**. Tagline: **EQUIP | PERFORM | INSPIRE**.

Dark storefront with neon lime CTAs. Opening-shop stock only — **184 SKUs** in `/data/products.json`. Unit prices are retail (USD). Guest browse and cart are enabled. Checkout is a stub (no real payments).

This is not a Joma brand clone. Layout and page density follow a professional B2B catalog pattern; branding, copy, and imagery are RAPPI.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

Production build:

```bash
npm run build
npm start
```

## Demo login

- Email: `shop@rappi.com`
- Password: `rappi123`
- Or use **Continue as guest** on `/login` to browse and check out without an account.

Orders placed in checkout are stored in this browser (`localStorage`) and show under **Account → Orders** when you are signed in with the same email.

## Catalog

Source rows: `/data/products-source.json`  
Normalized catalog: `/data/products.json`

Regenerate from the sheet JSON:

```bash
npm run catalog
```

Uncategorized apparel maps to **Sportswear**. Football-related rows (socks, shin guards, keeper gloves, footballs, boots, sets) map to **Football**. Mislabeled sheet categories are remapped (swimwear/caps/goggles → Swimming, rugby* → Rugby, cricket* → Cricket, running/yoga/towels → Running & Fitness, bags/volleyball → Balls & Bags).

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
| `/checkout` | Shipping + place order stub |
| `/checkout/confirmation` | Order confirmation |
| `/account` | Account home |
| `/account/orders` | Order history |
| `/account/profile` | Profile |
| `/promotions` | Promotions |

Top nav branches with stock: Sportswear, Football, Basketball, Netball, Swimming, Rugby, Cricket, Boxing, Hockey, Running & Fitness, Shoes, Balls & Bags.

## Stack

Next.js App Router, TypeScript, Tailwind CSS v4, shadcn-style UI primitives, Zustand (cart / auth / orders).
