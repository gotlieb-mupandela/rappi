import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogFilters } from "@/components/catalog-filters";
import { HubTile } from "@/components/hub-tile";
import { collectionTiles } from "@/lib/hubs";
import { paginateListing } from "@/lib/listing";
import { getCatalog } from "@/lib/supabase/catalog";

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    cat?: string;
    sub?: string;
    size?: string;
    max?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const catalog = await getCatalog();
  const highlighted = catalog.filter(
    (p) => p.badge === "offer" || p.badge === "new",
  );
  const q = (sp.q ?? "").trim().toLowerCase();
  const sub = sp.sub && sp.sub !== "all" ? sp.sub : "";
  const max = sp.max ? Number(sp.max) : NaN;
  const filtered = highlighted.filter((p) => {
    if (sub && p.subcategory !== sub) return false;
    if (Number.isFinite(max) && p.price > max) return false;
    if (q) {
      const hay = `${p.code} ${p.item} ${p.name} ${p.title} ${p.category}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  const listing = paginateListing(filtered, sp);
  const collections = collectionTiles(catalog);

  return (
    <div className="page-shell py-8">
      <Breadcrumbs
        items={[{ href: "/", label: "Home" }, { label: "New collections" }]}
      />
      <h1 className="mt-6 font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-wide md:text-5xl">
        New collections
      </h1>
      <p className="mt-2 max-w-xl text-sm text-[#A0A0A0]">
        Opening-season footwear and apparel. New and offer pieces from the current drop.
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
              listing={listing}
              basePath="/promotions"
              grouped
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}
