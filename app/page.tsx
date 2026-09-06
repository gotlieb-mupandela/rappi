import Link from "next/link";
import { HubTile } from "@/components/hub-tile";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { CATEGORIES, TAGLINE } from "@/lib/catalog";
import { collectionTiles, kidsHubGroups, shoeHubGroups } from "@/lib/hubs";
import { products, productsByCategory } from "@/lib/products";
import type { Product } from "@/lib/types";

export default function HomePage() {
  const featured = CATEGORIES.filter((c) => c.featured);
  const rest = CATEGORIES.filter((c) => !c.featured);
  const spotlight = (
    ["104409.484", "TOJS2604TF", "RR300W2680", "C448S2715"] as const
  )
    .map((code) => products.find((p) => p.code === code))
    .filter((p): p is Product => Boolean(p));
  const collections = collectionTiles();
  const footwear = shoeHubGroups();
  const kids = kidsHubGroups();
  const football = productsByCategory("football");

  return (
    <div>
      <section className="border-b border-[#1F1F1F] bg-[radial-gradient(circle_at_top_left,_rgba(182,255,0,0.12),_transparent_42%),linear-gradient(#101010,#0B0B0B)]">
        <div className="mx-auto max-w-[1440px] px-4 py-8 sm:py-14 lg:px-6 lg:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B6FF00] sm:text-xs sm:tracking-[0.28em]">
            {TAGLINE}
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-oswald)] text-4xl uppercase leading-[0.95] tracking-tight text-white sm:text-5xl md:text-7xl">
            RAPPI SPORTS HUB
          </h1>
          <p className="mt-5 max-w-xl text-sm text-[#A0A0A0] sm:text-base">
            Opening shop stock. {products.length} SKUs across sportswear, football,
            court sports, and kit. Retail unit prices in Namibian dollars (N$). Browse as
            a guest or sign in to track orders.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/category/sportswear">Shop sportswear</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/search">Search by code</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-10 lg:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-[family-name:var(--font-oswald)] text-2xl uppercase tracking-wide sm:text-3xl">
            Featured
          </h2>
          <p className="hidden text-xs uppercase tracking-[0.16em] text-[#A0A0A0] sm:block">
            Sportswear · Football · Running & Fitness · Shoes
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {featured.map((c) => (
            <HubTile
              key={c.slug}
              slug={c.slug}
              name={c.name}
              compact
              product={productsByCategory(c.slug)[0]}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-10 lg:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-[family-name:var(--font-oswald)] text-2xl uppercase tracking-wide sm:text-3xl">
            New collections
          </h2>
          <Link
            href="/promotions"
            className="text-xs uppercase tracking-wider text-[#B6FF00]"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {collections.map((c) => (
            <HubTile
              key={c.key}
              slug={c.key === "footwear" ? "shoes" : "sportswear"}
              name={c.name}
              count={c.count}
              href={c.href}
              product={c.sample}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-10 lg:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-[family-name:var(--font-oswald)] text-2xl uppercase tracking-wide sm:text-3xl">
            Footwear
          </h2>
          <Link
            href="/category/shoes"
            className="text-xs uppercase tracking-wider text-[#B6FF00]"
          >
            Shop shoes
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {footwear.map((g) => (
            <HubTile
              key={g.key}
              slug="shoes"
              name={g.name}
              count={g.count}
              href={g.href}
              product={g.sample}
              banner={g.banner}
              shape="square"
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-10 lg:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-[family-name:var(--font-oswald)] text-2xl uppercase tracking-wide sm:text-3xl">
            Kids
          </h2>
          <Link
            href="/shop/sportswear?sub=tees-kids"
            className="text-xs uppercase tracking-wider text-[#B6FF00]"
          >
            Shop kids
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {kids.map((g) => (
            <HubTile
              key={g.key}
              slug="sportswear"
              name={g.name}
              count={g.count}
              href={g.href}
              product={g.sample}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-10 lg:px-6">
        <h2 className="mb-6 font-[family-name:var(--font-oswald)] text-2xl uppercase tracking-wide sm:text-3xl">
          Shop by sport
        </h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {rest.map((c) => (
            <HubTile
              key={c.slug}
              slug={c.slug}
              name={c.name}
              product={productsByCategory(c.slug)[0]}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-16 lg:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-[family-name:var(--font-oswald)] text-2xl uppercase tracking-wide sm:text-3xl">
            Opening stock
          </h2>
          <Link href="/search" className="text-xs uppercase tracking-wider text-[#B6FF00]">
            View all SKUs
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {(spotlight.length ? spotlight : football.slice(0, 6)).map((p) => (
            <ProductCard key={p.code} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
