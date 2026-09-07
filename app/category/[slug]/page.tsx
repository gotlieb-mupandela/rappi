import { notFound } from "next/navigation";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { HubTile } from "@/components/hub-tile";
import { Button } from "@/components/ui/button";
import { CATEGORIES, categoryBySlug } from "@/lib/catalog";
import { shoeHubGroups } from "@/lib/hubs";
import { productsByCategory, subcategoriesFor } from "@/lib/products";
import { getCatalog } from "@/lib/supabase/catalog";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function CategoryHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = categoryBySlug(slug);
  if (!cat) notFound();
  const catalog = await getCatalog();
  const items = productsByCategory(slug, catalog);
  const subs = subcategoriesFor(slug, catalog);
  const shoeGroups = slug === "shoes" ? shoeHubGroups(catalog) : [];

  return (
    <div className="page-shell py-8">
      <Breadcrumbs
        items={[{ href: "/", label: "Home" }, { label: cat.name }]}
      />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-wide md:text-5xl">
            {cat.name}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#A0A0A0]">
            {cat.blurb} {items.length} SKUs in opening stock.
          </p>
        </div>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={`/shop/${slug}`}>View all products</Link>
        </Button>
      </div>

      {slug === "shoes" && shoeGroups.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {shoeGroups.map((g) => (
            <HubTile
              key={g.key}
              slug={slug}
              name={g.name}
              count={g.count}
              href={g.href}
              product={g.sample}
              banner={g.banner}
              shape="square"
            />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {subs.map((s) => (
            <HubTile
              key={s.slug}
              slug={slug}
              name={s.name}
              count={s.count}
              href={`/shop/${slug}?sub=${encodeURIComponent(s.slug)}`}
              product={items.find((p) => p.subcategory === s.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
