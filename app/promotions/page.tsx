import { Suspense } from "react";
import { CatalogFilters } from "@/components/catalog-filters";
import { HubTile } from "@/components/hub-tile";
import { PageHeader } from "@/components/page-header";
import { SectionHeading } from "@/components/section-heading";
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
    <div>
      <PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: "New collections" }]}
        eyebrow="Drop"
        title="New collections"
        description="Opening-season footwear and apparel. New and offer pieces from the current drop."
      />
      <div className="page-shell py-10 lg:py-14">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
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

        <section className="mt-14">
          <SectionHeading title={`Highlighted stock [${highlighted.length}]`} />
          {highlighted.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">
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
        </section>
      </div>
    </div>
  );
}
