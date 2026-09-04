import Link from "next/link";
import { HubTile } from "@/components/hub-tile";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { CATEGORIES, TAGLINE } from "@/lib/catalog";
import { products } from "@/lib/products";
import type { Product } from "@/lib/types";

export default function HomePage() {
  const featured = CATEGORIES.filter((c) => c.featured);
  const rest = CATEGORIES.filter((c) => !c.featured);
  const spotlight = (
    ["104409.484", "TOJS2604TF", "RR300W2680", "C448S2715"] as const
  )
    .map((code) => products.find((p) => p.code === code))
    .filter((p): p is Product => Boolean(p));

  return (
    <div>
      <section className="border-b border-[#1F1F1F] bg-[radial-gradient(circle_at_top_left,_rgba(182,255,0,0.12),_transparent_42%),linear-gradient(#101010,#0B0B0B)]">
        <div className="mx-auto max-w-[1440px] px-4 py-14 lg:px-6 lg:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#B6FF00]">
            {TAGLINE}
          </p>
          <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-oswald)] text-5xl uppercase leading-[0.95] tracking-tight text-white md:text-7xl">
            RAPPI SPORTS HUB
          </h1>
          <p className="mt-5 max-w-xl text-base text-[#A0A0A0]">
            Opening shop stock. {products.length} SKUs across sportswear, football,
            court sports, and kit. Retail unit prices. Browse as a guest or sign in to
            track orders.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/category/sportswear">Shop sportswear</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/search">Search by code</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-10 lg:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-wide">
            Featured
          </h2>
          <p className="text-xs uppercase tracking-[0.16em] text-[#A0A0A0]">
            Sportswear · Football · Running & Fitness · Shoes
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {featured.map((c) => (
            <HubTile key={c.slug} slug={c.slug} name={c.name} compact />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-10 lg:px-6">
        <h2 className="mb-6 font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-wide">
          Shop by sport
        </h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {rest.map((c) => (
            <HubTile key={c.slug} slug={c.slug} name={c.name} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-16 lg:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-wide">
            Opening stock
          </h2>
          <Link href="/search" className="text-xs uppercase tracking-wider text-[#B6FF00]">
            View all SKUs
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4">
          {spotlight.map((p) => (p ? <ProductCard key={p.code} product={p} /> : null))}
        </div>
      </section>
    </div>
  );
}
