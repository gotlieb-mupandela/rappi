import Link from "next/link";
import { OrderLinesPreview } from "@/components/admin/order-line-items";
import { Button } from "@/components/ui/button";
import { ORDER_LINE_LIST_SELECT, sanitizeSearch } from "@/lib/admin/order-lines";
import { formatDate, formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Orders · Admin" };

const STATUSES = ["reserved", "preparing", "shipped", "cancelled"] as const;

type OrderRow = {
  id: string;
  email: string;
  full_name: string;
  total: number;
  status: (typeof STATUSES)[number];
  created_at: string;
  city: string;
  country: string;
  order_items: {
    id: string;
    code: string;
    name: string;
    size: string;
    qty: number;
    unit_price: number;
    product_id: string | null;
  }[] | null;
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      `id, email, full_name, total, status, created_at, city, country, order_items (${ORDER_LINE_LIST_SELECT})`,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (sp.status && STATUSES.includes(sp.status as (typeof STATUSES)[number])) {
    query = query.eq("status", sp.status as (typeof STATUSES)[number]);
  }

  const q = sanitizeSearch(sp.q ?? "");
  if (q) {
    query = query.or(`id.ilike.%${q}%,email.ilike.%${q}%,full_name.ilike.%${q}%`);
  }

  const { data } = await query;
  const orders = (data ?? []) as OrderRow[];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-oswald)] text-3xl uppercase sm:text-4xl">
        Orders
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        See what customers bought — size, quantity, and SKU — then update fulfillment.
      </p>

      <form className="mt-6 flex flex-wrap gap-2">
        {sp.status ? <input type="hidden" name="status" value={sp.status} /> : null}
        <input
          name="q"
          defaultValue={sp.q ?? ""}
          placeholder="Search order id, email, or name"
          className="h-10 min-w-[220px] flex-1 rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-4 text-sm"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={q ? `/admin/orders?q=${encodeURIComponent(q)}` : "/admin/orders"}
          className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-wider ${
            !sp.status
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-[var(--border)] text-[var(--muted)]"
          }`}
        >
          All
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={`rounded-full border px-3 py-1.5 text-[11px] uppercase tracking-wider ${
              sp.status === s
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            {s}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border)]">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-[var(--hover)] text-[11px] uppercase tracking-wider text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Ship to</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-[var(--muted)]">
                  No orders in this queue.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-mono font-bold text-[var(--accent)] hover:underline"
                    >
                      {o.id}
                    </Link>
                    <p className="text-xs text-[var(--muted)]">{o.email}</p>
                  </td>
                  <td className="px-4 py-3 text-xs leading-5">
                    {o.full_name}
                    <br />
                    {o.city}, {o.country}
                  </td>
                  <td className="px-4 py-3">
                    <OrderLinesPreview items={o.order_items ?? []} />
                  </td>
                  <td className="px-4 py-3">{formatPrice(Number(o.total))}</td>
                  <td className="px-4 py-3 text-[11px] uppercase tracking-wider">
                    {o.status}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {formatDate(o.created_at)}
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
