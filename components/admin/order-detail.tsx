"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { OrderLineItems } from "@/components/admin/order-line-items";
import { Button } from "@/components/ui/button";
import {
  fillMissingProducts,
  mapOrderLine,
  ORDER_LINE_SELECT,
  type OrderLine,
  type RawOrderLine,
} from "@/lib/admin/order-lines";
import { formatDate, formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Status = Database["public"]["Enums"]["order_status"];

const STEPS: Status[] = ["reserved", "preparing", "shipped", "cancelled"];

export function OrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderLine[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const [{ data: o }, { data: lines }] = await Promise.all([
        supabase.from("orders").select("*").eq("id", orderId).single(),
        supabase.from("order_items").select(ORDER_LINE_SELECT).eq("order_id", orderId),
      ]);
      if (!o) {
        toast.error("Order not found");
        router.push("/admin/orders");
        return;
      }
      setOrder(o);
      setNotes(o.notes ?? "");
      setItems(await fillMissingProducts(supabase, (lines as RawOrderLine[] | null)?.map(mapOrderLine) ?? []));
      setLoading(false);
    })();
  }, [orderId, router]);

  async function setStatus(status: Status) {
    if (!order) return;
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("set_order_status", {
      p_order_id: order.id,
      p_status: status,
    });
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    setOrder(data as Order);
    toast.success(`Status → ${status}`);
    setSaving(false);
    router.refresh();
  }

  async function saveNotes() {
    if (!order) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ notes }).eq("id", order.id);
    if (error) toast.error(error.message);
    else toast.success("Notes saved");
    setSaving(false);
  }

  if (loading || !order) {
    return <p className="text-[var(--muted)]">Loading…</p>;
  }

  return (
    <div>
      <Link
        href="/admin/orders"
        className="text-xs uppercase tracking-wider text-[var(--muted)] hover:text-[var(--accent)]"
      >
        ← Orders
      </Link>
      <h1 className="mt-2 font-mono text-3xl font-bold text-[var(--accent)]">{order.id}</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">{formatDate(order.created_at)}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <Button
            key={s}
            type="button"
            size="sm"
            variant={order.status === s ? "default" : "outline"}
            disabled={saving}
            onClick={() => void setStatus(s)}
          >
            {s}
          </Button>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider">Ship to</h2>
          <p className="mt-3 text-sm leading-6">
            {order.full_name}
            <br />
            {order.address}
            <br />
            {order.city}, {order.country}
            <br />
            {order.user_id ? (
              <Link href={`/admin/customers/${order.user_id}`} className="text-[var(--accent)] hover:underline">
                {order.email}
              </Link>
            ) : (
              order.email
            )}
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">{order.shipping_method}</p>
        </section>
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider">Totals</h2>
          <p className="mt-3 flex justify-between text-sm">
            <span>Merchandise</span>
            <span>{formatPrice(Number(order.subtotal))}</span>
          </p>
          <p className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{formatPrice(Number(order.shipping_cost))}</span>
          </p>
          <p className="mt-2 flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(Number(order.total))}</span>
          </p>
        </section>
      </div>

      <div className="mt-4">
        <OrderLineItems items={items} />
      </div>

      <section className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider">Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mt-3 h-24 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3 text-sm"
        />
        <Button type="button" className="mt-3" disabled={saving} onClick={() => void saveNotes()}>
          Save notes
        </Button>
      </section>
    </div>
  );
}
