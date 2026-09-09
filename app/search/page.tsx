import { CatalogBrowser } from "@/components/catalog-browser";
import { PageHeader } from "@/components/page-header";
import { SearchEmpty } from "@/components/search-empty";
import { getCatalog } from "@/lib/supabase/catalog";
import { getT } from "@/lib/i18n/server";

export const revalidate = 3600;

export default async function SearchPage() {
  const catalog = await getCatalog();
  const t = await getT();

  return (
    <div>
      <PageHeader
        crumbs={[{ href: "/", label: t("common.home") }, { label: t("search.crumb") }]}
        eyebrow={t.plural("count.pieces", catalog.length)}
        title={t("search.title")}
        description={t("search.descriptionEmpty")}
      />
      <div className="page-shell py-8 sm:py-10">
        <CatalogBrowser
          basePath="/search"
          requireQuery
          grouped={false}
          showCategoryFilter
          emptyTitle={t("search.emptyTitle")}
          emptyBody={t("search.emptyBody")}
          emptyQuery={<SearchEmpty />}
        />
      </div>
    </div>
  );
}
