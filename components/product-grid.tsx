import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { SUBCATEGORY_LABELS } from "@/lib/catalog";

export function ProductGrid({
  products,
  grouped = false,
}: {
  products: Product[];
  grouped?: boolean;
}) {
  if (products.length === 0) {
    return (
      <div className="border border-[#2A2A2A] bg-[#141414] px-6 py-16 text-center">
        <p className="text-lg font-semibold text-white">No products found</p>
        <p className="mt-2 text-sm text-[#A0A0A0]">
          Try another code, category, or clear filters.
        </p>
      </div>
    );
  }

  if (!grouped) {
    return (
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.code} product={p} />
        ))}
      </div>
    );
  }

  const groups = new Map<string, Product[]>();
  for (const p of products) {
    const key = p.subcategory;
    const list = groups.get(key) ?? [];
    list.push(p);
    groups.set(key, list);
  }

  return (
    <div className="space-y-10">
      {[...groups.entries()].map(([sub, list]) => (
        <section key={sub}>
          <div className="mb-4 flex items-end justify-between border-b border-[#2A2A2A] pb-2">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
              {SUBCATEGORY_LABELS[sub] ?? sub} [{list.length}]
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
            {list.map((p) => (
              <ProductCard key={p.code} product={p} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
