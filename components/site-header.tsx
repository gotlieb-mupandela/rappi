"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { CATEGORIES } from "@/lib/catalog";
import { useAuth } from "@/lib/stores/auth";
import { cartCount, useCart } from "@/lib/stores/cart";
import { CategorySubNav } from "@/components/category-sub-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const lines = useCart((s) => s.lines);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const count = cartCount(lines);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
    setOpen(false);
  }

  const activeSlug = CATEGORIES.find(
    (c) => pathname === `/category/${c.slug}` || pathname.startsWith(`/shop/${c.slug}`),
  )?.slug;

  return (
    <header className="sticky top-0 z-50 border-b border-[#1F1F1F] bg-[#0B0B0B]/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-4 lg:px-6">
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center text-white lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href="/" className="flex min-w-0 shrink items-center">
          <Image
            src="/brand/rappi-logo.png"
            alt="RAPPI SPORTS HUB"
            width={210}
            height={56}
            className="h-8 w-auto max-w-[148px] object-contain sm:h-10 sm:max-w-none"
            priority
          />
        </Link>

        <form onSubmit={onSearch} className="mx-4 hidden max-w-sm flex-1 md:flex lg:max-w-md">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B6B6B]" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by code"
              className="pl-9"
              aria-label="Search catalog"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <Link
            href="/search"
            className="flex h-11 w-11 items-center justify-center text-white hover:text-[#B6FF00] md:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            className="relative flex h-11 w-11 items-center justify-center text-white hover:text-[#B6FF00]"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {ready && count > 0 ? (
              <span className="absolute right-1 top-1 min-w-4 rounded-full bg-[#B6FF00] px-1 text-center text-[10px] font-bold leading-4 text-[#0B0B0B]">
                {count}
              </span>
            ) : null}
          </Link>
          {ready && user ? (
            <div className="relative group">
              <Link
                href="/account"
                className="flex h-11 items-center gap-2 px-2 text-white hover:text-[#B6FF00]"
              >
                <User className="h-5 w-5" />
                <span className="hidden text-[11px] font-semibold uppercase tracking-wider sm:inline">
                  {user.name}
                </span>
              </Link>
              <div className="invisible absolute right-0 top-full z-20 min-w-40 border border-[#2A2A2A] bg-[#1A1A1A] py-1 opacity-0 shadow-xl group-hover:visible group-hover:opacity-100">
                <Link href="/account/orders" className="block px-3 py-2 text-xs uppercase tracking-wider hover:bg-[#222] hover:text-[#B6FF00]">
                  Orders
                </Link>
                <Link href="/account/profile" className="block px-3 py-2 text-xs uppercase tracking-wider hover:bg-[#222] hover:text-[#B6FF00]">
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.push("/");
                  }}
                  className="block w-full px-3 py-2 text-left text-xs uppercase tracking-wider hover:bg-[#222] hover:text-[#B6FF00]"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex h-11 items-center gap-2 px-2 text-white hover:text-[#B6FF00]"
            >
              <User className="h-5 w-5" />
              <span className="hidden text-[11px] font-semibold uppercase tracking-wider sm:inline">
                Account
              </span>
            </Link>
          )}
        </div>
      </div>

      <nav className="hidden border-t border-[#1A1A1A] lg:block">
        <ul className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 py-2.5">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/category/${c.slug}`}
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.16em] text-[#C8C8C8] hover:text-[#B6FF00]",
                  activeSlug === c.slug &&
                    "text-white underline decoration-[#B6FF00] decoration-2 underline-offset-8",
                )}
              >
                {c.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/promotions"
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B6FF00] hover:text-[#C8FF00]",
                pathname === "/promotions" &&
                  "underline decoration-2 underline-offset-8",
              )}
            >
              New collections
            </Link>
          </li>
        </ul>
      </nav>
      <Suspense fallback={null}>
        <CategorySubNav />
      </Suspense>

      {open ? (
        <div className="max-h-[calc(100dvh-3.5rem-env(safe-area-inset-top))] overflow-y-auto border-t border-[#1F1F1F] bg-[#0B0B0B] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden">
          <form onSubmit={onSearch} className="mb-4">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by code, title, category"
              className="h-11"
            />
          </form>
          <ul className="grid grid-cols-2 gap-1">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  className={cn(
                    "flex min-h-11 items-center px-2 text-xs font-semibold uppercase tracking-wider text-white hover:text-[#B6FF00]",
                    activeSlug === c.slug && "text-[#B6FF00]",
                  )}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-2">
            <Button asChild className="w-full" variant="outline">
              <Link href="/promotions">New collections</Link>
            </Button>
            <Button asChild className="w-full" variant="outline">
              <Link href={user ? "/account" : "/login"}>
                {user ? "My account" : "Sign in"}
              </Link>
            </Button>
            {user ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  logout();
                  setOpen(false);
                  router.push("/");
                }}
              >
                Logout
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
