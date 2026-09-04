import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { SUBCATEGORY_LABELS } from "@/lib/catalog";

const GRID =
  "grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

export function ProductGrid({
  products,
  grouped = false,
  layout = "grid",
}: {
  products: Product[];
  grouped?: boolean;
  layout?: "grid" | "list";
}) {
  if (products.length === 0) {
    return (
      <div className="border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
        <p className="text-lg font-semibold text-white">No products found</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Try another code, category, or clear filters.
        </p>
      </div>
    );
  }

  if (!grouped) {
    if (layout === "list") {
      return (
        <div>
          {products.map((p) => (
            <ProductCard key={p.code} product={p} layout="list" />
          ))}
        </div>
      );
    }
    return (
      <div className={GRID}>
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
  const entries = [...groups.entries()];

  return (
    <div className="space-y-10">
      {entries.length > 1 ? (
        <nav className="scroll-touch flex gap-x-5 overflow-x-auto border-b border-[var(--border)] pb-2">
          {entries.map(([sub, list]) => (
            <a
              key={sub}
              href={`#${sub}`}
              className="inline-flex min-h-10 shrink-0 items-center whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] hover:text-[var(--accent)]"
            >
              {SUBCATEGORY_LABELS[sub] ?? sub} [{list.length}]
            </a>
          ))}
        </nav>
      ) : null}
      {entries.map(([sub, list]) => (
        <section key={sub} id={sub}>
          <div className="mb-4 bg-[#1A1A1A] px-3 py-2">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
              {SUBCATEGORY_LABELS[sub] ?? sub} [{list.length}]
            </h2>
          </div>
          {layout === "list" ? (
            <div>
              {list.map((p) => (
                <ProductCard key={p.code} product={p} layout="list" />
              ))}
            </div>
          ) : (
            <div className={GRID}>
              {list.map((p) => (
                <ProductCard key={p.code} product={p} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
