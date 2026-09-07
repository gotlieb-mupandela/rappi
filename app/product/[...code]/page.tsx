import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductDetail } from "@/components/product-detail";
import { ProductCard } from "@/components/product-card";
import { categoryBySlug } from "@/lib/catalog";
import { getProduct, productsByCategory } from "@/lib/product-utils";
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
        <section className="mt-16">
          <h2 className="mb-6 font-[family-name:var(--font-oswald)] text-2xl uppercase">
            More in {cat?.name}
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.code} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
