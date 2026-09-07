"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
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
  const [accountOpen, setAccountOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const lines = useCart((s) => s.lines);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const count = cartCount(lines);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    setOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onPointer(e: Event) {
      if (!accountRef.current?.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAccountOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

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
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[#080808]/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150">
      <div className="page-shell flex h-14 items-center gap-2 sm:h-[4.25rem] sm:gap-4">
        <button
          type="button"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/5 lg:hidden"
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

        <form onSubmit={onSearch} className="mx-4 hidden max-w-md flex-1 md:flex lg:max-w-lg">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-2)]" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by code"
              className="h-10 pl-10"
              aria-label="Search catalog"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <Link
            href="/search"
            className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/5 hover:text-[var(--accent)] md:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/cart"
            className="relative flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/5 hover:text-[var(--accent)]"
            aria-label="Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {ready && count > 0 ? (
              <span className="price absolute right-1 top-1 min-w-4 rounded-full bg-[var(--accent)] px-1 text-center text-[10px] font-bold leading-4 text-[var(--on-accent)]">
                {count}
              </span>
            ) : null}
          </Link>
          {ready && user ? (
            <div className="relative" ref={accountRef}>
              <button
                type="button"
                className="flex h-11 items-center gap-2 rounded-full px-2 text-white transition-colors hover:bg-white/5 hover:text-[var(--accent)]"
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                onClick={() => setAccountOpen((v) => !v)}
              >
                <User className="h-5 w-5" />
                <span className="hidden text-[11px] font-semibold uppercase tracking-wider sm:inline">
                  {user.name}
                </span>
              </button>
              {accountOpen ? (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-20 mt-1 min-w-44 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] py-1 shadow-[var(--shadow-soft)]"
                >
                  <Link
                    href="/account"
                    role="menuitem"
                    className="block px-3 py-2.5 text-xs uppercase tracking-wider hover:bg-white/5 hover:text-[var(--accent)]"
                  >
                    Account
                  </Link>
                  <Link
                    href="/account/orders"
                    role="menuitem"
                    className="block px-3 py-2.5 text-xs uppercase tracking-wider hover:bg-white/5 hover:text-[var(--accent)]"
                  >
                    Orders
                  </Link>
                  <Link
                    href="/account/profile"
                    role="menuitem"
                    className="block px-3 py-2.5 text-xs uppercase tracking-wider hover:bg-white/5 hover:text-[var(--accent)]"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      logout();
                      setAccountOpen(false);
                      router.push("/");
                    }}
                    className="block w-full px-3 py-2.5 text-left text-xs uppercase tracking-wider hover:bg-white/5 hover:text-[var(--accent)]"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex h-11 items-center gap-2 rounded-full px-2 text-white transition-colors hover:bg-white/5 hover:text-[var(--accent)]"
            >
              <User className="h-5 w-5" />
              <span className="hidden text-[11px] font-semibold uppercase tracking-wider sm:inline">
                Account
              </span>
            </Link>
          )}
        </div>
      </div>

      <nav className="hidden border-t border-[var(--border)] lg:block">
        <ul className="page-shell flex flex-wrap items-center justify-center gap-x-6 gap-y-2 py-3">
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/category/${c.slug}`}
                data-active={activeSlug === c.slug || undefined}
                className={cn(
                  "nav-link text-[11px] font-semibold uppercase tracking-[0.16em]",
                )}
              >
                {c.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/promotions"
              data-active={pathname === "/promotions" || undefined}
              className="nav-link text-[11px] font-semibold uppercase tracking-[0.16em] !text-[var(--accent)]"
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
        <div className="max-h-[calc(100dvh-3.5rem-env(safe-area-inset-top))] overflow-y-auto border-t border-[var(--border)] bg-[#080808] px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:hidden">
          <form onSubmit={onSearch} className="mb-5">
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
                    "flex min-h-11 items-center rounded-lg px-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-white/5 hover:text-[var(--accent)]",
                    activeSlug === c.slug && "text-[var(--accent)]",
                  )}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid gap-2">
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
