"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, type ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useT } from "@/components/locale-provider";
import { loadListingIndex } from "@/lib/listing-index";
import type { StorefrontTaxonomy } from "@/lib/listing-types";

export function StorefrontChrome({
  children,
  taxonomy,
  categoryCounts,
}: {
  children: ReactNode;
  taxonomy: StorefrontTaxonomy;
  categoryCounts: Record<string, number>;
}) {
  const pathname = usePathname();
  const t = useT();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (!isAdmin) void loadListingIndex();
  }, [isAdmin]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <a href="#main" className="skip-link">
        {t("skip")}
      </a>
      <Suspense fallback={null}>
        <SiteHeader taxonomy={taxonomy} categoryCounts={categoryCounts} />
      </Suspense>
      <main id="main" key={pathname} className="page-enter flex-1">
        {children}
      </main>
      <SiteFooter categoryCounts={categoryCounts} />
    </>
  );
}
