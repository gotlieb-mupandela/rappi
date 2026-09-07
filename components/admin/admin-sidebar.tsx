"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Package,
  Settings2,
  ShoppingBag,
  Truck,
  Users,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/content", label: "Content", icon: Settings2 },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-[var(--border)] bg-[#070707] lg:w-60 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <BrandLogo variant="mark" className="h-10 w-10" />
        <div>
          <p className="font-[family-name:var(--font-oswald)] text-sm uppercase tracking-wide text-white">
            RAPPI Admin
          </p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted-2)]">
            Back office
          </p>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-2 py-3 lg:flex-col lg:overflow-visible">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm transition-colors",
                active
                  ? "bg-[var(--accent-muted)] text-[var(--accent)]"
                  : "text-[var(--muted)] hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-[var(--border)] p-3">
        <Link
          href="/"
          className="mb-2 block rounded-lg px-3 py-2 text-xs uppercase tracking-wider text-[var(--muted)] hover:text-white"
        >
          View storefront
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--muted)] hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
