"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import { CATEGORIES, SUBCATEGORY_LABELS } from "@/lib/catalog";
import { ProductGrid } from "@/components/product-grid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CatalogFilters({
  products,
  categorySlug,
  basePath,
  grouped = true,
  showCategoryFilter = false,
}: {
  products: Product[];
  categorySlug?: string;
  basePath: string;
  grouped?: boolean;
  showCategoryFilter?: boolean;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const sub = params.get("sub") ?? "all";
  const size = params.get("size") ?? "all";
  const maxPrice = params.get("max") ?? "";
  const q = params.get("q") ?? "";
  const cat = params.get("cat") ?? categorySlug ?? "all";
  const [draftQ, setDraftQ] = useState(q);

  const sizeOptions = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => set.add(s.size)));
    return [...set];
  }, [products]);

  const subs = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => map.set(p.subcategory, (map.get(p.subcategory) ?? 0) + 1));
    return [...map.entries()];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (sub !== "all" && p.subcategory !== sub) return false;
      if (size !== "all" && !p.sizes.some((s) => s.size === size && s.stock > 0)) {
        return false;
      }
      if (maxPrice && p.price > Number(maxPrice)) return false;
      if (q) {
        const needle = q.toLowerCase();
        const hay = `${p.code} ${p.item} ${p.name} ${p.title} ${p.category}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [products, cat, sub, size, maxPrice, q]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    const qs = next.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="space-y-6">
        {showCategoryFilter ? (
          <FilterBlock title="Category">
            <FilterLink active={cat === "all"} onClick={() => setParam("cat", "all")}>
              All ({products.length})
            </FilterLink>
            {CATEGORIES.map((c) => {
              const n = products.filter((p) => p.category === c.slug).length;
              if (!n) return null;
              return (
                <FilterLink
                  key={c.slug}
                  active={cat === c.slug}
                  onClick={() => setParam("cat", c.slug)}
                >
                  {c.name} ({n})
                </FilterLink>
              );
            })}
          </FilterBlock>
        ) : null}

        <FilterBlock title="Type">
          <FilterLink active={sub === "all"} onClick={() => setParam("sub", "all")}>
            All ({products.length})
          </FilterLink>
          {subs.map(([slug, n]) => (
            <FilterLink
              key={slug}
              active={sub === slug}
              onClick={() => setParam("sub", slug)}
            >
              {SUBCATEGORY_LABELS[slug] ?? slug} ({n})
            </FilterLink>
          ))}
        </FilterBlock>

        <FilterBlock title="Size">
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setParam("size", "all")}
              className={cn(
                "border px-2 py-1 text-[11px] uppercase",
                size === "all"
                  ? "border-[#B6FF00] text-[#B6FF00]"
                  : "border-[#2A2A2A] text-[#A0A0A0] hover:border-white",
              )}
            >
              All
            </button>
            {sizeOptions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setParam("size", s)}
                className={cn(
                  "border px-2 py-1 text-[11px] uppercase",
                  size === s
                    ? "border-[#B6FF00] text-[#B6FF00]"
                    : "border-[#2A2A2A] text-[#A0A0A0] hover:border-white",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </FilterBlock>

        <FilterBlock title="Max price">
          <Input
            type="number"
            min={0}
            step="0.01"
            placeholder="USD"
            defaultValue={maxPrice}
            onBlur={(e) => setParam("max", e.target.value)}
          />
        </FilterBlock>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setParam("q", draftQ);
          }}
          className="space-y-2"
        >
          <Label>Filter text</Label>
          <Input
            value={draftQ}
            onChange={(e) => setDraftQ(e.target.value)}
            placeholder="Code or title"
          />
        </form>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => router.push(basePath)}
        >
          Clear filters
        </Button>
      </aside>

      <div>
        <p className="mb-4 text-xs uppercase tracking-[0.16em] text-[#A0A0A0]">
          {filtered.length} article{filtered.length === 1 ? "" : "s"} found
        </p>
        <ProductGrid products={filtered} grouped={grouped} />
      </div>
    </div>
  );
}

function FilterBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A0A0A0]">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterLink({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "block w-full text-left text-[12px] uppercase tracking-wider",
        active ? "text-[#B6FF00]" : "text-[#C8C8C8] hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
