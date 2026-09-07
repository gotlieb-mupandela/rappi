import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogFilters } from "@/components/catalog-filters";
import { CATEGORIES, categoryBySlug } from "@/lib/catalog";
import { productsByCategory } from "@/lib/products";
import { getCatalog } from "@/lib/supabase/catalog";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function ShopListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = categoryBySlug(slug);
  if (!cat) notFound();
  const catalog = await getCatalog();
  const items = productsByCategory(slug, catalog);

  return (
    <div className="page-shell py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: `/category/${slug}`, label: cat.name },
          { label: "Products" },
        ]}
      />
      <h1 className="mt-7 font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-wide sm:text-5xl">
        {cat.name}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {items.length} piece{items.length === 1 ? "" : "s"}
      </p>
      <div className="mt-8 sm:mt-10">
        <Suspense>
          <CatalogFilters
            products={items}
            categorySlug={slug}
            basePath={`/shop/${slug}`}
            grouped
          />
        </Suspense>
      </div>
    </div>
  );
}
