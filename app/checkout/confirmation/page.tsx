"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/format";
import { useOrders } from "@/lib/stores/orders";

function ConfirmationInner() {
  const params = useSearchParams();
  const id = params.get("id");
  const order = useOrders((s) => s.orders.find((o) => o.id === id));

  if (!order) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-16 text-center">
        <h1 className="font-[family-name:var(--font-oswald)] text-4xl uppercase">
          Order not found
        </h1>
        <p className="mt-3 text-sm text-[#A0A0A0]">
          This confirmation is stored in this browser only.
        </p>
        <Button asChild className="mt-6">
          <Link href="/account/orders">View orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 lg:px-6">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/cart", label: "Cart" },
          { label: "Confirmation" },
        ]}
      />
      <p className="mt-6 text-xs uppercase tracking-[0.2em] text-[#B6FF00]">
        Order placed
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-oswald)] text-4xl uppercase">
        {order.id}
      </h1>
      <p className="mt-2 text-sm text-[#A0A0A0]">{formatDate(order.createdAt)}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="border border-[#2A2A2A] bg-[#141414] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider">Ship to</h2>
          <p className="mt-3 text-sm leading-6">
            {order.name}
            <br />
            {order.address}
            <br />
            {order.city}, {order.country}
            <br />
            {order.email}
          </p>
          <p className="mt-3 text-sm text-[#A0A0A0]">{order.shippingMethod}</p>
        </section>
        <section className="border border-[#2A2A2A] bg-[#141414] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider">Totals</h2>
          <p className="mt-3 flex justify-between text-sm">
            <span>Merchandise</span>
            <span>{formatPrice(order.subtotal)}</span>
          </p>
          <p className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{formatPrice(order.shippingCost)}</span>
          </p>
          <p className="mt-2 flex justify-between text-lg font-semibold">
            <span>Total (N$)</span>
            <span>{formatPrice(order.total)}</span>
          </p>
        </section>
      </div>

      <section className="mt-4 border border-[#2A2A2A] bg-[#141414] p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider">Items</h2>
        <ul className="mt-3 divide-y divide-[#2A2A2A] text-sm">
          {order.items.map((item) => (
            <li key={`${item.code}-${item.size}`} className="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between">
              <span className="break-words">
                {item.code} · {item.name} · {item.size} × {item.qty}
              </span>
              <span className="shrink-0 font-semibold">{formatPrice(item.price * item.qty)}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/account/orders">View in account</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationInner />
    </Suspense>
  );
}
