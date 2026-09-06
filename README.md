# RAPPI SPORTS HUB

Consumer sports catalog for **RAPPI SPORTS HUB**. Tagline: **EQUIP | PERFORM | INSPIRE**.

Dark storefront with neon lime CTAs. Opening-shop stock only — **184 SKUs** in `/data/products.json`. Unit prices are retail Namibian dollars (**N$**). Guest browse and cart are enabled. Checkout is a stub (no real payments).

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
Normalized catalog: `/data/products.json` (treat as the product DB)

Integrity checks (184 unique SKUs, NAD currency, spot-check prices, 4–5 photos each):

```bash
npm run check:catalog
```

Regenerate from the sheet JSON:

```bash
npm run catalog
```

Product photos live at `public/products/{safeCode}/01…05.webp`. `safeCode` is the SKU with `.` and `/` replaced by `-`. Cards use photo 01; the PDP gallery uses the full set. Rebuild photos from family bases with `npm run images` after placing bases in `data/catalog-bases/` (`pip3 install pillow` first).

Uncategorized apparel (`cat` null) maps to **Sportswear**, except `FOOTBALL*` / `SOCKS` / `SHIN*` / `GOALKEEPER*` which map to **Football**. Mislabeled sheet categories are remapped (swimwear/caps/goggles → Swimming, rugby* → Rugby, cricket* → Cricket, shoe codes including TRAINING SHOES → Shoes, running/yoga/towels → Running & Fitness, bags/volleyball → Balls & Bags). Every source code is kept (184 SKUs).

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
