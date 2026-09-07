import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { AUDIENCES, CATEGORIES, TAGLINE } from "@/lib/catalog";

export function SiteFooter({
  categoryCounts,
}: {
  categoryCounts?: Record<string, number>;
}) {
  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--footer-bg)]">
      <div className="page-shell grid gap-10 py-12 md:grid-cols-3">
        <div>
          <BrandLogo className="h-24 w-auto" />
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            {TAGLINE}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--muted)]">
            Consumer sportswear and equipment. Live opening stock, sold at retail in Namibian dollars.
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Shop
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
            {AUDIENCES.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/shop/${a.slug}`}
                  className="text-ink/90 transition-colors hover:text-[var(--accent)]"
                >
                  {a.name}
                </Link>
              </li>
            ))}
            {CATEGORIES.filter((c) => !categoryCounts || (categoryCounts[c.slug] ?? 0) > 0).map(
              (c) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  className="text-ink/90 transition-colors hover:text-[var(--accent)]"
                >
                  {c.name}
                </Link>
              </li>
              ),
            )}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Account
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/login" className="transition-colors hover:text-[var(--accent)]">
                Login
              </Link>
            </li>
            <li>
              <Link href="/account/orders" className="transition-colors hover:text-[var(--accent)]">
                Orders
              </Link>
            </li>
            <li>
              <Link href="/cart" className="transition-colors hover:text-[var(--accent)]">
                Cart
              </Link>
            </li>
            <li>
              <Link href="/promotions" className="transition-colors hover:text-[var(--accent)]">
                New collections
              </Link>
            </li>
            <li>
              <Link href="/search" className="transition-colors hover:text-[var(--accent)]">
                Search
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--border)] py-4 text-center text-[11px] tracking-wide text-[var(--muted-2)]">
        RAPPI SPORTS HUB · Independent consumer store · Not affiliated with any wholesale catalog brand
      </div>
    </footer>
  );
}
