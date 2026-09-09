import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderLineItems, OrderLinesPreview } from "@/components/admin/order-line-items";
import { Badge } from "@/components/ui/badge";
import {
  fillMissingProducts,
  mapOrderLine,
  ORDER_LINE_SELECT,
  type RawOrderLine,
} from "@/lib/admin/order-lines";
import { formatDate, formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Customer · Admin" };

type OrderWithItems = {
  id: string;
  email: string;
  full_name: string;
  total: number;
  status: string;
  created_at: string;
  city: string;
  country: string;
  order_items: RawOrderLine[] | null;
};

export default async function AdminCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!profile) notFound();

  const { data: orderRows } = await supabase
    .from("orders")
    .select(
      `id, email, full_name, total, status, created_at, city, country, order_items (${ORDER_LINE_SELECT})`,
    )
    .or(`user_id.eq.${id},email.eq.${profile.email}`)
    .order("created_at", { ascending: false })
    .limit(50);

  const orders = (orderRows ?? []) as OrderWithItems[];
  const unique = new Map(orders.map((o) => [o.id, o]));
  const list = [...unique.values()];

  const hydrated = await Promise.all(
    list.map(async (order) => ({
      ...order,
      lines: await fillMissingProducts(
        supabase,
        (order.order_items ?? []).map(mapOrderLine),
      ),
    })),
  );

  const gmv = hydrated
    .filter((o) => o.status !== "cancelled")
    .reduce((n, o) => n + Number(o.total), 0);

  return (
    <div>
      <Link
        href="/admin/customers"
        className="text-xs uppercase tracking-wider text-[var(--muted)] hover:text-[var(--accent)]"
      >
        ← Customers
      </Link>
      <h1 className="mt-2 font-[family-name:var(--font-oswald)] text-3xl uppercase sm:text-4xl">
        {profile.full_name || profile.email}
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{profile.email}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Role
          </p>
          <p className="mt-2">
            <Badge variant={profile.role === "admin" ? "new" : "muted"}>{profile.role}</Badge>
          </p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Orders
          </p>
          <p className="mt-2 font-[family-name:var(--font-oswald)] text-3xl">{hydrated.length}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            GMV
          </p>
          <p className="mt-2 font-[family-name:var(--font-oswald)] text-3xl">{formatPrice(gmv)}</p>
        </div>
      </div>

      <p className="mt-4 text-xs text-[var(--muted)]">
        Joined {formatDate(profile.created_at)}. Role changes stay in SQL{" "}
        <code className="text-[var(--accent)]">promote_admin</code>.
      </p>

      <section className="mt-10 space-y-6">
        <h2 className="font-[family-name:var(--font-oswald)] text-xl uppercase">Order history</h2>
        {hydrated.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">No orders for this customer.</p>
        ) : (
          hydrated.map((order) => (
            <article
              key={order.id}
              className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-mono font-bold text-[var(--accent)] hover:underline"
                  >
                    {order.id}
                  </Link>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {formatDate(order.created_at)} · {order.city}, {order.country}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wider">{order.status}</p>
                  <p className="font-semibold">{formatPrice(Number(order.total))}</p>
                  <OrderLinesPreview items={order.lines} />
                </div>
              </div>
              <OrderLineItems items={order.lines} />
            </article>
          ))
        )}
      </section>
    </div>
  );
}
