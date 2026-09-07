"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/stores/auth";
import { useOrders } from "@/lib/stores/orders";

export default function AccountPage() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const orders = useOrders((s) => s.orders);
  const router = useRouter();

  if (!user) {
    return (
      <div className="mx-auto max-w-[640px] px-4 py-16 text-center">
        <h1 className="font-[family-name:var(--font-oswald)] text-4xl uppercase">Account</h1>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Sign in with the demo shop account to view orders and profile.
        </p>
        <Button asChild className="mt-6">
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="page-shell py-8">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "My account" }]} />
      <h1 className="mt-6 font-[family-name:var(--font-oswald)] text-4xl uppercase">
        My account
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Signed in as {user.email}</p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Link href="/account/orders" className="surface-card p-6">
          <p className="text-xs uppercase tracking-wider text-[var(--accent)]">Orders</p>
          <p className="mt-2 text-2xl font-semibold">{orders.length}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">View, track, and reopen order details.</p>
        </Link>
        <Link href="/account/profile" className="surface-card p-6">
          <p className="text-xs uppercase tracking-wider text-[var(--accent)]">Profile</p>
          <p className="mt-2 text-2xl font-semibold">{user.name}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">Contact details for this demo shop.</p>
        </Link>
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="surface-card p-6 text-left"
        >
          <p className="text-xs uppercase tracking-wider text-[var(--muted)]">Session</p>
          <p className="mt-2 text-2xl font-semibold">Logout</p>
          <p className="mt-1 text-sm text-[var(--muted)]">End this browser session.</p>
        </button>
      </div>
    </div>
  );
}
