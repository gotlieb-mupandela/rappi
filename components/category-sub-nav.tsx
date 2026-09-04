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
    <nav className="border-t border-[#1A1A1A] bg-[#121212]">
      <ul className="scroll-touch mx-auto flex max-w-[1440px] gap-x-5 overflow-x-auto px-3 py-2.5 sm:gap-x-6 sm:px-4 lg:justify-center lg:px-6">
        <li className="shrink-0">
          <Link
            href={`/shop/${slug}`}
            className={cn(
              "inline-flex min-h-11 items-center whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.12em] text-[#C8C8C8] hover:text-[#B6FF00]",
              onShop && !active &&
                "text-white underline decoration-[#B6FF00] decoration-2 underline-offset-8",
            )}
          >
            All
          </Link>
        </li>
        {subs.map((s) => (
          <li key={s.slug} className="shrink-0">
            <Link
              href={`/shop/${slug}?sub=${encodeURIComponent(s.slug)}`}
              className={cn(
                "inline-flex min-h-11 items-center whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.12em] text-[#C8C8C8] hover:text-[#B6FF00]",
                active === s.slug &&
                  "text-white underline decoration-[#B6FF00] decoration-2 underline-offset-8",
              )}
            >
              {s.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
