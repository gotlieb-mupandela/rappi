import Link from "next/link";
import { CATEGORIES, TAGLINE } from "@/lib/catalog";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[#1F1F1F] bg-[#0B0B0B]">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-10 md:grid-cols-3 lg:px-6">
        <div>
          <p className="text-sm font-bold tracking-[0.2em] text-white">RAPPI SPORTS HUB</p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#B6FF00]">
            {TAGLINE}
          </p>
          <p className="mt-3 max-w-sm text-sm text-[#A0A0A0]">
            Consumer sportswear and equipment storefront. Opening shop stock, sold at unit
            retail prices in Namibian dollars (N$). No wholesale tariffs.
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A0A0A0]">
            Shop
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-y-1.5 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className="text-white hover:text-[#B6FF00]">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A0A0A0]">
            Account
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li>
              <Link href="/login" className="hover:text-[#B6FF00]">
                Login
              </Link>
            </li>
            <li>
              <Link href="/account/orders" className="hover:text-[#B6FF00]">
                Orders
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-[#B6FF00]">
                Cart
              </Link>
            </li>
            <li>
              <Link href="/promotions" className="hover:text-[#B6FF00]">
                New collections
              </Link>
            </li>
            <li>
              <Link href="/search" className="hover:text-[#B6FF00]">
                Search
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#1F1F1F] py-3 text-center text-[11px] text-[#6B6B6B]">
        RAPPI SPORTS HUB · Independent consumer store · Not affiliated with any wholesale catalog brand
      </div>
    </footer>
  );
}
