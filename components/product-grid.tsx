import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { SUBCATEGORY_LABELS } from "@/lib/catalog";

const GRID =
  "grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(15.75rem,1fr))]";

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
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
        <p className="text-lg font-semibold text-ink">No products found</p>
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
  const labeled = entries.filter(([sub]) => SUBCATEGORY_LABELS[sub]).length;
  const shouldGroup =
    entries.length > 1 &&
    entries.length <= 8 &&
    labeled >= Math.ceil(entries.length / 2);

  if (!shouldGroup) {
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

  return (
    <div className="space-y-10">
      {entries.length > 1 ? (
        <nav className="scroll-touch mb-2 flex gap-x-6 overflow-x-auto border-b border-[var(--border)] pb-3">
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
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-ink">
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
