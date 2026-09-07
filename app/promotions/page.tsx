import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogFilters } from "@/components/catalog-filters";
import { HubTile } from "@/components/hub-tile";
import { collectionTiles } from "@/lib/hubs";
import { listingModel, queryFromSearchParams } from "@/lib/listing";
import { getCatalog } from "@/lib/supabase/catalog";

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const catalog = await getCatalog();
  const highlighted = catalog.filter(
    (p) => p.badge === "offer" || p.badge === "new",
  );
  const collections = collectionTiles(catalog);
  const sp = await searchParams;
  const model = listingModel(highlighted, queryFromSearchParams(sp));

  return (
    <div className="page-shell py-8">
      <Breadcrumbs
        items={[{ href: "/", label: "Home" }, { label: "New collections" }]}
      />
      <h1 className="mt-6 font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-wide md:text-5xl">
        New collections
      </h1>
      <p className="mt-2 max-w-xl text-sm text-[#A0A0A0]">
        Highlighted footwear and apparel. New and offer pieces from the current catalog.
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
            No promotions on this catalog list.
          </p>
        ) : (
          <Suspense>
            <CatalogFilters
              products={model.products}
              basePath="/promotions"
              grouped
              totalCount={model.totalCount}
              sourceCount={model.sourceCount}
              page={model.page}
              pages={model.pages}
              subCounts={model.subCounts}
              sizeOptions={model.sizeOptions}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
