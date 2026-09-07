"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/catalog";
import { subcategoriesFor } from "@/lib/products";
import { cn } from "@/lib/utils";

export function CategorySubNav() {
  const pathname = usePathname();
  const params = useSearchParams();
  const slug = CATEGORIES.find(
    (c) =>
      pathname === `/category/${c.slug}` || pathname.startsWith(`/shop/${c.slug}`),
  )?.slug;

  if (!slug) return null;

  const subs = subcategoriesFor(slug);
  if (subs.length < 2) return null;

  const active = params.get("sub");
  const onShop = pathname.startsWith(`/shop/${slug}`);

  return (
    <nav className="border-t border-[var(--border)] bg-[#0d0d0d]/90">
      <ul className="scroll-touch page-shell flex gap-x-6 overflow-x-auto py-1 lg:justify-center">
        <li className="shrink-0">
          <Link
            href={`/shop/${slug}`}
            data-active={onShop && !active ? "true" : undefined}
            className={cn(
              "nav-link inline-flex min-h-11 items-center whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.12em]",
            )}
          >
            All
          </Link>
        </li>
        {subs.map((s) => (
          <li key={s.slug} className="shrink-0">
            <Link
              href={`/shop/${slug}?sub=${encodeURIComponent(s.slug)}`}
              data-active={active === s.slug ? "true" : undefined}
              className="nav-link inline-flex min-h-11 items-center whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.12em]"
            >
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
