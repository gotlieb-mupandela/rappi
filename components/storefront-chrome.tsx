"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export function StorefrontChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>
      <main id="main" key={pathname} className="page-enter flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
