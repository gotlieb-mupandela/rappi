import Link from "next/link";
import { OrderLinesPreview } from "@/components/admin/order-line-items";
import { loadLinesByOrderId } from "@/lib/admin/order-lines";
import { formatDate, formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin" };

const STATUSES = ["reserved", "preparing", "shipped", "cancelled"] as const;

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: skuCount },
    { count: lowStock },
    { data: orderRows },
    { data: recentRows },
    { data: soldRows },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .gt("stock_qty", 0)
      .lt("stock_qty", 5),
    supabase.from("orders").select("id, status, total"),
    supabase
      .from("orders")
      .select("id, email, full_name, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("order_items").select("code, name, qty, unit_price, order_id").limit(4000),
  ]);

  const statusById = new Map((orderRows ?? []).map((row) => [row.id, row.status]));
  const statusCounts = { reserved: 0, preparing: 0, shipped: 0, cancelled: 0 };
  let gmv = 0;
  let paidCount = 0;
  for (const row of orderRows ?? []) {
    const s = row.status as keyof typeof statusCounts;
    if (s in statusCounts) statusCounts[s] += 1;
    if (row.status !== "cancelled") {
      gmv += Number(row.total) || 0;
      paidCount += 1;
    }
  }
  const aov = paidCount ? gmv / paidCount : 0;

  const sold = new Map<string, { code: string; name: string; qty: number; revenue: number }>();
  for (const raw of soldRows ?? []) {
    const status = statusById.get(raw.order_id);
    if (status !== "reserved" && status !== "preparing" && status !== "shipped") continue;
    const current = sold.get(raw.code) ?? {
      code: raw.code,
      name: raw.name,
      qty: 0,
      revenue: 0,
    };
    current.qty += Number(raw.qty) || 0;
    current.revenue += (Number(raw.unit_price) || 0) * (Number(raw.qty) || 0);
    sold.set(raw.code, current);
  }
  const topProducts = [...sold.values()].sort((a, b) => b.qty - a.qty).slice(0, 8);
  const topCodes = topProducts.map((p) => p.code);
  const { data: topProductRows } = topCodes.length
    ? await supabase.from("products").select("id, code, image_url").in("code", topCodes)
    : { data: [] as { id: string; code: string; image_url: string }[] };
  const productMeta = new Map((topProductRows ?? []).map((row) => [row.code, row]));

  const recentOrders = recentRows ?? [];
  const recentLines = await loadLinesByOrderId(
    supabase,
    recentOrders.map((o) => o.id),
  );

  const cards = [
    { label: "GMV", value: formatPrice(gmv), href: "/admin/orders" },
    { label: "Orders", value: String(paidCount), href: "/admin/orders" },
    { label: "AOV", value: formatPrice(aov), href: "/admin/orders" },
    { label: "Low stock", value: String(lowStock ?? 0), href: "/admin/products?low=1" },
  ];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-oswald)] text-3xl uppercase tracking-wide sm:text-4xl">
        Dashboard
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Sales, catalog, and fulfillment for web + mobile. {skuCount ?? 0} SKUs in catalog.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--border-strong)]"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {c.label}
            </p>
            <p className="mt-2 font-[family-name:var(--font-oswald)] text-3xl text-ink">
              {c.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[11px] uppercase tracking-wider text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {s} · {statusCounts[s]}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-[family-name:var(--font-oswald)] text-xl uppercase">
              Top products
            </h2>
            <Link
              href="/admin/products"
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]"
            >
              Catalog
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--hover)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-[var(--muted)]">
                      No sold items yet.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p) => {
                    const meta = productMeta.get(p.code);
                    const inner = (
                      <span className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={meta?.image_url || "/brand/rappi-logo.png"}
                          alt=""
                          className="h-10 w-10 rounded-lg bg-[var(--bg-elevated)] object-cover"
                        />
                        <span>
                          <span className="block font-mono font-bold">{p.code}</span>
                          <span className="block text-xs text-[var(--muted)]">{p.name}</span>
                        </span>
                      </span>
                    );
                    return (
                      <tr key={p.code} className="border-t border-[var(--border)]">
                        <td className="px-4 py-3">
                          {meta?.id ? (
                            <Link href={`/admin/products/${meta.id}`} className="hover:text-[var(--accent)]">
                              {inner}
                            </Link>
                          ) : (
                            inner
                          )}
                        </td>
                        <td className="px-4 py-3 font-[family-name:var(--font-oswald)] text-lg">
                          {p.qty}
                        </td>
                        <td className="px-4 py-3">{formatPrice(p.revenue)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-[family-name:var(--font-oswald)] text-xl uppercase">
              Recent orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]"
            >
              View all
            </Link>
          </div>
          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--hover)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-[var(--muted)]">
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((o) => (
                    <tr key={o.id} className="border-t border-[var(--border)]">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className="font-mono font-bold text-[var(--accent)] hover:underline"
                        >
                          {o.id}
                        </Link>
                        <p className="text-xs text-[var(--muted)]">{o.full_name}</p>
                        <p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                          {o.status} · {formatDate(o.created_at)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <OrderLinesPreview items={recentLines.get(o.id) ?? []} />
                      </td>
                      <td className="px-4 py-3">{formatPrice(Number(o.total))}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
