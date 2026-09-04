"use client";

import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/format";
import { useAuth } from "@/lib/stores/auth";
import { useOrders } from "@/lib/stores/orders";

const STEPS = ["Next", "Preparing", "Waiting", "Reserved", "Shipped", "Delivered"] as const;

export default function OrdersPage() {
  const user = useAuth((s) => s.user);
  const orders = useOrders((s) => s.orders);
  const mine = user ? orders.filter((o) => o.email === user.email) : orders;

  if (!user) {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-16 text-center">
        <h1 className="font-[family-name:var(--font-oswald)] text-4xl uppercase">Orders</h1>
        <p className="mt-3 text-sm text-[#A0A0A0]">Sign in to see orders tied to your account.</p>
        <Button asChild className="mt-6">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/account", label: "My account" },
          { label: "Orders" },
        ]}
      />
      <h1 className="mt-6 font-[family-name:var(--font-oswald)] text-4xl uppercase">
        Orders
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[#A0A0A0]">
        Order history to view or track orders already placed. Checkout is a stub — status
        starts at Reserved.
      </p>

      {!mine.length ? (
        <div className="mt-10 border border-[#2A2A2A] bg-[#141414] px-6 py-16 text-center">
          <p className="text-lg font-semibold">No orders yet</p>
          <p className="mt-2 text-sm text-[#A0A0A0]">Place a stub order from checkout to see it here.</p>
        </div>
      ) : (
        <>
        <div className="mt-8 space-y-4 md:hidden">
          {mine.map((order) => {
            const active =
              order.status === "shipped" ? "Shipped" : order.status === "preparing" ? "Preparing" : "Reserved";
            return (
              <article key={order.id} className="border border-[#2A2A2A] bg-[#141414] p-4">
                <p className="font-mono text-lg font-bold text-[#B6FF00]">{order.id}</p>
                <p className="mt-1 text-xs text-[#A0A0A0]">{formatDate(order.createdAt)}</p>
                <p className="mt-3 text-sm">
                  {order.name}
                  <br />
                  {order.city}, {order.country}
                </p>
                <p className="mt-3 text-lg font-semibold">{formatPrice(order.total)}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-[#B6FF00]">{active}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-8 hidden overflow-x-auto border border-[#B6FF00]/35 md:block">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-[#161616] text-[11px] uppercase tracking-wider text-[#A0A0A0]">
              <tr>
                <th className="px-3 py-3">Date</th>
                <th className="px-3 py-3">Order</th>
                <th className="px-3 py-3">Ship to</th>
                <th className="px-3 py-3">Total</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {mine.map((order) => {
                const active =
                  order.status === "shipped" ? "Shipped" : order.status === "preparing" ? "Preparing" : "Reserved";
                return (
                  <tr key={order.id} className="border-t border-[#2A2A2A] align-top">
                    <td className="px-3 py-4 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="px-3 py-4">
                      <p className="font-mono font-bold text-[#B6FF00]">{order.id}</p>
                      <p className="text-xs text-[#A0A0A0]">{order.items.length} line(s)</p>
                    </td>
                    <td className="px-3 py-4 text-xs leading-5">
                      {order.name}
                      <br />
                      {order.address}
                      <br />
                      {order.city}, {order.country}
                    </td>
                    <td className="px-3 py-4">{formatPrice(order.total)}</td>
                    <td className="px-3 py-4">
                      <ol className="space-y-1">
                        {STEPS.map((step) => (
                          <li key={step} className="flex items-center gap-2 text-[11px]">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                step === active ? "bg-[#B6FF00]" : "border border-[#4A4A4A]"
                              }`}
                            />
                            <span className={step === active ? "text-white" : "text-[#6B6B6B]"}>
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        </>
      )}
    </div>
  );
}
