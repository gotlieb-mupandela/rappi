import Link from "next/link";
import { CatalogFilters } from "@/components/catalog-filters";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { AUDIENCES, CATEGORIES } from "@/lib/catalog";
import { buildListing } from "@/lib/listing";
import { getCatalog } from "@/lib/supabase/catalog";
import { getT } from "@/lib/i18n/server";
import { audienceName, hubName } from "@/lib/i18n/labels";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    cat?: string;
    sub?: string;
    size?: string;
    max?: string;
    audience?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const catalog = await getCatalog();
  const listing = buildListing(catalog, sp, { requireQuery: true });
  const t = await getT();

  return (
    <div>
      <PageHeader
        crumbs={[{ href: "/", label: t("common.home") }, { label: t("search.crumb") }]}
        eyebrow={
          q
            ? t.plural("count.results", listing.total)
            : t.plural("count.pieces", catalog.length)
        }
        title={t("search.title")}
        description={
          q
            ? t("search.descriptionQuery", { q })
            : t("search.descriptionEmpty")
        }
      />
      <div className="page-shell py-8 sm:py-10">
        {!q ? (
          <EmptySearch t={t} />
        ) : (
          <CatalogFilters
            listing={listing}
            query={sp}
            basePath="/search"
            grouped={false}
            showCategoryFilter
            emptyTitle={t("search.emptyTitle")}
            emptyBody={t("search.emptyBody")}
          />
        )}
      </div>
    </div>
  );
}

function EmptySearch({ t }: { t: Awaited<ReturnType<typeof getT>> }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-12">
      <form action="/search" className="mx-auto max-w-xl">
        <label htmlFor="search-q" className="sr-only">
          {t("nav.searchAria")}
        </label>
        <input
          id="search-q"
          name="q"
          type="search"
          autoFocus
          placeholder={t("nav.searchPlaceholderLong")}
          className="h-12 w-full rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-5 text-sm text-ink placeholder:text-[var(--muted-2)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
        />
        <div className="mt-4 flex justify-center">
          <Button type="submit" size="lg">
            {t("nav.search")}
          </Button>
        </div>
      </form>
      <p className="mx-auto mt-8 max-w-xl text-center text-sm text-[var(--muted)]">
        {t("search.hint")}
      </p>
      <ul className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-2">
        {AUDIENCES.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/shop/${a.slug}`}
              className="inline-flex h-10 items-center rounded-full border border-[var(--border-strong)] px-4 text-[11px] font-semibold uppercase tracking-wider text-ink hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {audienceName(a.slug, t)}
            </Link>
          </li>
        ))}
        {CATEGORIES.filter((c) =>
          ["sportswear", "shoes", "football", "balls-bags", "swimming"].includes(c.slug),
        ).map((c) => (
          <li key={c.slug}>
            <Link
              href={`/shop/${c.slug}`}
              className="inline-flex h-10 items-center rounded-full border border-[var(--border-strong)] px-4 text-[11px] font-semibold uppercase tracking-wider text-ink hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              {hubName(c.slug, t)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
