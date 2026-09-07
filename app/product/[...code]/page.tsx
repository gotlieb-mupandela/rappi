import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductDetail } from "@/components/product-detail";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { categoryBySlug } from "@/lib/catalog";
import { getProduct, productsByCategory } from "@/lib/products";
import { getCatalog } from "@/lib/supabase/catalog";
import { decodeProductCode } from "@/lib/utils";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ code: string[] }>;
}) {
  const { code } = await params;
  const sku = decodeProductCode(code);
  const catalog = await getCatalog();
  const product = getProduct(sku, catalog);
  if (!product) notFound();
  const cat = categoryBySlug(product.category);
  const related = productsByCategory(product.category, catalog)
    .filter((p) => p.code !== product.code)
    .slice(0, 4);

  return (
    <div className="page-shell py-8">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: `/category/${product.category}`, label: cat?.name ?? product.category },
          { href: `/shop/${product.category}`, label: "Products" },
          { label: product.code },
        ]}
      />
      <div className="mt-8">
        <ProductDetail product={product} />
      </div>
      {related.length ? (
        <section className="mt-16 border-t border-[var(--border)] pt-12">
          <SectionHeading
            title={`More in ${cat?.name ?? "this hub"}`}
            href={`/shop/${product.category}`}
            linkLabel="Shop all"
          />
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.code} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
