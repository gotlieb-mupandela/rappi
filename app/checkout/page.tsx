"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/format";
import { getProduct } from "@/lib/products";
import { useAuth } from "@/lib/stores/auth";
import { useCart } from "@/lib/stores/cart";
import { useOrders } from "@/lib/stores/orders";
import type { Order } from "@/lib/types";

const SHIPPING = [
  { id: "standard", name: "Standard (5–8 days)", cost: 12 },
  { id: "express", name: "Express (2–3 days)", cost: 28 },
  { id: "pickup", name: "Hub pickup", cost: 0 },
];

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const user = useAuth((s) => s.user);
  const addOrder = useOrders((s) => s.add);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [method, setMethod] = useState(SHIPPING[0].id);
  const [notes, setNotes] = useState("");

  const rows = useMemo(
    () =>
      lines
        .map((line) => {
          const product = getProduct(line.code);
          if (!product) return null;
          return {
            code: line.code,
            name: product.name,
            size: line.size,
            qty: line.qty,
            price: product.price,
          };
        })
        .filter(Boolean) as Order["items"],
    [lines],
  );

  const subtotal = rows.reduce((s, r) => s + r.price * r.qty, 0);
  const shipping = SHIPPING.find((s) => s.id === method) ?? SHIPPING[0];
  const total = subtotal + shipping.cost;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!rows.length) {
      toast.error("Cart is empty.");
      return;
    }
    if (!name || !email || !address || !city || !country) {
      toast.error("Complete shipping details.");
      return;
    }
    const id = `RSH${Date.now().toString().slice(-8)}`;
    const order: Order = {
      id,
      createdAt: new Date().toISOString(),
      email,
      name,
      address,
      city,
      country,
      shippingMethod: shipping.name,
      shippingCost: shipping.cost,
      items: rows,
      subtotal,
      total,
      status: "reserved",
    };
    addOrder(order);
    clear();
    toast.success("Order placed.");
    router.push(`/checkout/confirmation?id=${id}`);
  }

  if (!rows.length) {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-16 text-center">
        <p className="text-lg">Nothing to check out.</p>
        <Button asChild className="mt-6">
          <Link href="/cart">Back to cart</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/cart", label: "Cart" },
          { label: "Shipping & billing" },
        ]}
      />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-oswald)] text-4xl uppercase">
            Shipping & billing
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#A0A0A0]">
            Select a delivery address and shipping method, then place the order. Payment
            is stubbed — no real charges.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-4">
          <section className="border border-[#2A2A2A] bg-[#141414] p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider">Shipping address</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Full name">
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </Field>
              <Field label="Email">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address">
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
                </Field>
              </div>
              <Field label="City">
                <Input value={city} onChange={(e) => setCity(e.target.value)} required />
              </Field>
              <Field label="Country">
                <Input value={country} onChange={(e) => setCountry(e.target.value)} required />
              </Field>
            </div>
          </section>
          <section className="border border-[#2A2A2A] bg-[#141414] p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider">Shipping method</h2>
            <div className="mt-4 space-y-2">
              {SHIPPING.map((s) => (
                <label
                  key={s.id}
                  className="flex cursor-pointer items-center justify-between border border-[#2A2A2A] px-3 py-3 has-[:checked]:border-[#B6FF00]"
                >
                  <span className="flex items-center gap-3 text-sm">
                    <input
                      type="radio"
                      name="ship"
                      checked={method === s.id}
                      onChange={() => setMethod(s.id)}
                    />
                    {s.name}
                  </span>
                  <span className="text-sm font-semibold">
                    {s.cost ? formatPrice(s.cost) : "Free"}
                  </span>
                </label>
              ))}
            </div>
          </section>
          <section className="border border-[#2A2A2A] bg-[#141414] p-5">
            <Label>Order notes</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2 h-24 w-full rounded-md border border-[#2A2A2A] bg-[#121212] p-3 text-sm"
              placeholder="Optional"
            />
          </section>
        </div>

        <aside className="h-fit border border-[#B6FF00]/30 bg-[#141414] p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider">Order summary</h2>
          <ul className="mt-4 divide-y divide-[#2A2A2A] text-sm">
            {rows.map((r) => (
              <li key={`${r.code}-${r.size}`} className="flex justify-between py-2">
                <span>
                  {r.code} · {r.size} × {r.qty}
                </span>
                <span>{formatPrice(r.price * r.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 text-sm">
            <p className="flex justify-between text-[#A0A0A0]">
              <span>Merchandise</span>
              <span>{formatPrice(subtotal)}</span>
            </p>
            <p className="flex justify-between text-[#A0A0A0]">
              <span>Shipping</span>
              <span>{shipping.cost ? formatPrice(shipping.cost) : "Free"}</span>
            </p>
            <p className="flex justify-between pt-2 text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </p>
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full">
            Place order
          </Button>
          <p className="mt-3 text-center text-[11px] text-[#6B6B6B]">
            Checkout stub — no payment is collected.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <Label>{label}</Label>
      {children}
    </label>
  );
}
