"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { revalidateStorefront } from "@/app/admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { sanitizeSearch } from "@/lib/admin/order-lines";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

type BadgeValue = Database["public"]["Enums"]["product_badge"];

type Row = {
  id: string;
  code: string;
  item: string;
  name: string;
  category_slug: string;
  price: number;
  badge: BadgeValue | null;
  image_url: string;
};

const FILTERS = [
  { id: "highlighted", label: "Highlighted" },
  { id: "new", label: "New" },
  { id: "offer", label: "Offer" },
  { id: "search", label: "Search catalog" },
] as const;

export default function AdminPromotionsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("highlighted");
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function fetchRows(nextFilter: (typeof FILTERS)[number]["id"], nextQ: string) {
    const supabase = createClient();
    let query = supabase
      .from("products")
      .select("id, code, item, name, category_slug, price, badge, image_url")
      .order("code")
      .limit(400);

    const term = sanitizeSearch(nextQ);
    if (nextFilter === "new") query = query.eq("badge", "new");
    else if (nextFilter === "offer") query = query.eq("badge", "offer");
    else if (nextFilter === "highlighted") query = query.in("badge", ["new", "offer"]);
    else if (term) query = query.or(`code.ilike.%${term}%,item.ilike.%${term}%,name.ilike.%${term}%`);
    else return [] as Row[];

    const { data, error } = await query;
    if (error) toast.error(error.message);
    return (data ?? []) as Row[];
  }

  async function load(nextFilter = filter, nextQ = q) {
    setLoading(true);
    const data = await fetchRows(nextFilter, nextQ);
    setRows(data);
    setSelected(new Set());
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    void fetchRows("highlighted", "").then((data) => {
      if (cancelled) return;
      setRows(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function applyBadge(badge: BadgeValue | null, ids = [...selected]) {
    if (!ids.length) {
      toast.error("Select products first");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("products").update({ badge }).in("id", ids);
    if (error) toast.error(error.message);
    else {
      await revalidateStorefront();
      toast.success(badge ? `Set ${ids.length} to ${badge}` : `Cleared ${ids.length} badges`);
      await load();
    }
    setSaving(false);
  }

  async function setOne(id: string, badge: BadgeValue | "") {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .update({ badge: badge || null })
      .eq("id", id);
    if (error) toast.error(error.message);
    else {
      await revalidateStorefront();
      setRows((prev) => prev.map((row) => (row.id === id ? { ...row, badge: badge || null } : row)));
    }
    setSaving(false);
  }

  function onSearch(e: FormEvent) {
    e.preventDefault();
    if (filter === "search" && sanitizeSearch(q).length < 2) {
      toast.error("Type at least 2 characters to search");
      return;
    }
    void load(filter, q);
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-oswald)] text-3xl uppercase sm:text-4xl">
        Promotions
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Curate New / Offer badges. These drive the storefront{" "}
        <Link href="/promotions" className="text-[var(--accent)] hover:underline">
          /promotions
        </Link>{" "}
        page.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              setFilter(f.id);
              void load(f.id, q);
            }}
            className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-wider ${
              filter === f.id
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSearch} className="mt-4 flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={filter === "search" ? "Search catalog to badge" : "Narrow this list"}
          className="h-10 min-w-[220px] flex-1 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 text-sm"
        />
        <Button type="submit" variant="outline">
          Filter
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={saving} onClick={() => void applyBadge("new")}>
          Set New
        </Button>
        <Button type="button" size="sm" disabled={saving} onClick={() => void applyBadge("offer")}>
          Set Offer
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={saving}
          onClick={() => void applyBadge(null)}
        >
          Clear badge
        </Button>
        <p className="self-center text-xs text-[var(--muted)]">{selected.size} selected</p>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border)]">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-[var(--hover)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={rows.length > 0 && selected.size === rows.length}
                  onChange={(e) => {
                    setSelected(e.target.checked ? new Set(rows.map((r) => r.id)) : new Set());
                  }}
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Badge</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[var(--muted)]">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[var(--muted)]">
                  {filter === "search" ? "Search the catalog to add badges." : "No merchandised products."}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggle(row.id)}
                      aria-label={`Select ${row.code}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/products/${row.id}`}
                      className="flex items-center gap-3 hover:text-[var(--accent)]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={row.image_url || "/brand/rappi-logo.png"}
                        alt=""
                        className="h-12 w-12 rounded-lg bg-[var(--bg-elevated)] object-cover"
                      />
                      <span>
                        <span className="block font-mono font-bold">{row.code}</span>
                        <span className="block text-xs text-[var(--muted)]">{row.item || row.name}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs uppercase tracking-wider">{row.category_slug}</td>
                  <td className="px-4 py-3">{formatPrice(Number(row.price))}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {row.badge ? (
                        <Badge variant={row.badge === "offer" ? "offer" : "new"}>{row.badge}</Badge>
                      ) : (
                        <span className="text-[var(--muted-2)]">—</span>
                      )}
                      <select
                        value={row.badge ?? ""}
                        disabled={saving}
                        onChange={(e) => void setOne(row.id, e.target.value as BadgeValue | "")}
                        className="h-8 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-2 text-xs"
                      >
                        <option value="">None</option>
                        <option value="new">New</option>
                        <option value="offer">Offer</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
