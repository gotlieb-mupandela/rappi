import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CatalogFilters } from "@/components/catalog-filters";
import { CATEGORIES, categoryBySlug } from "@/lib/catalog";
import { productsByCategory } from "@/lib/products";

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
  const items = productsByCategory(slug);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: `/category/${slug}`, label: cat.name },
          { label: "Products" },
        ]}
      />
      <h1 className="mt-6 font-[family-name:var(--font-oswald)] text-4xl uppercase tracking-wide">
        {cat.name} [{items.length}]
      </h1>
      <div className="mt-8">
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
