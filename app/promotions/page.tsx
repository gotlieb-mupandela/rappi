import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogFilters } from "@/components/catalog-filters";
import { HubTile } from "@/components/hub-tile";
import { collectionTiles } from "@/lib/hubs";
import { products } from "@/lib/products";

export default function PromotionsPage() {
  const highlighted = products.filter(
    (p) => p.badge === "offer" || p.badge === "new",
  );
  const collections = collectionTiles();

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
      <Breadcrumbs
        items={[{ href: "/", label: "Home" }, { label: "New collections" }]}
      />
      <h1 className="mt-6 font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-wide md:text-5xl">
        New collections
      </h1>
      <p className="mt-2 max-w-xl text-sm text-[#A0A0A0]">
        Opening-season footwear and apparel. Highlighted SKUs carry New or Offer
        badges from the current stock list.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
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

      <h2 className="mt-14 font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-wide">
        Highlighted stock [{highlighted.length}]
      </h2>
      <div className="mt-8">
        {highlighted.length === 0 ? (
          <p className="text-sm text-[#A0A0A0]">
            No promotions on this opening stock list.
          </p>
        ) : (
          <Suspense>
            <CatalogFilters
              products={highlighted}
              basePath="/promotions"
              grouped
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
