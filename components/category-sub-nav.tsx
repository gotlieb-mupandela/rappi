"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CATEGORIES, SUBCATEGORY_LABELS } from "@/lib/catalog";
import type { StorefrontTaxonomy } from "@/lib/listing-types";
import { cn } from "@/lib/utils";

export function CategorySubNav({ taxonomy }: { taxonomy: StorefrontTaxonomy }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const slug = CATEGORIES.find(
    (c) =>
      pathname === `/category/${c.slug}` || pathname.startsWith(`/shop/${c.slug}`),
  )?.slug;

  if (!slug) return null;

  const subs = (taxonomy[slug] ?? []).filter(
    (s) => s.count > 0 && SUBCATEGORY_LABELS[s.slug],
  );
  if (subs.length < 2) return null;

  const active = params.get("sub");
  const onShop = pathname.startsWith(`/shop/${slug}`);

  return (
    <nav className="border-t border-[var(--border)] bg-[#0d0d0d]/90">
      <ul className="scroll-touch page-shell flex items-center gap-x-5 overflow-x-auto py-1 [mask-image:linear-gradient(90deg,transparent,black_1.25rem,black_calc(100%-1.25rem),transparent)] lg:justify-center lg:[mask-image:none] xl:gap-x-6">
        <li className="shrink-0">
          <Link
            href={`/shop/${slug}`}
            data-active={onShop && !active ? "true" : undefined}
            className={cn(
              "nav-link text-[11px] font-medium uppercase tracking-[0.12em]",
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
              className="nav-link text-[11px] font-medium uppercase tracking-[0.12em]"
            >
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
