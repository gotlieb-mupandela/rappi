import { notFound } from "next/navigation";
import Link from "next/link";
import { HubTile } from "@/components/hub-tile";
import { PageHeader } from "@/components/page-header";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { CATEGORIES, categoryBySlug } from "@/lib/catalog";
import { sampleForCategory } from "@/lib/classify";
import { audienceTiles, bramaHubGroups, rugbyHubGroups, shoeHubGroups } from "@/lib/hubs";
import { productsByCategory } from "@/lib/products";
import { getCatalog } from "@/lib/supabase/catalog";
import { productPath } from "@/lib/utils";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default async function CategoryHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = categoryBySlug(slug);
  if (!cat) notFound();
  const catalog = await getCatalog();
  const items = productsByCategory(slug, catalog);
  const sample = sampleForCategory(catalog, slug);
  const preview =
    slug === "rugby"
      ? [...items]
          .sort((a, b) => {
            const rank = (name: string) => {
              const n = name.toLowerCase();
              if (/\b(helmet|protection|protec)\b/.test(n)) return 2;
              if (/\bball\b/.test(n)) return 1;
              return 0;
            };
            return rank(a.displayName) - rank(b.displayName);
          })
          .slice(0, 12)
      : items.slice(0, 12);
  const shoeGroups = slug === "shoes" ? shoeHubGroups(catalog) : [];
  const rugbyGroups = slug === "rugby" ? rugbyHubGroups(catalog) : [];
  const bramaGroups = slug === "brama" ? bramaHubGroups(catalog) : [];
  const audiences = audienceTiles(catalog, { categorySlug: slug });
  const otherHubs = CATEGORIES.filter(
    (c) => c.slug !== slug && sampleForCategory(catalog, c.slug),
  );

  return (
    <div>
      <PageHeader
        crumbs={[{ href: "/", label: "Home" }, { label: cat.name }]}
        eyebrow={
          items.length
            ? `${items.length} piece${items.length === 1 ? "" : "s"}`
            : "Hub"
        }
        title={cat.name}
        description={cat.blurb}
        actions={
          items.length ? (
            <>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href={`/shop/${slug}`}>Shop all</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/search">Browse catalog</Link>
              </Button>
            </>
          ) : (
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/search">Browse catalog</Link>
            </Button>
          )
        }
        media={
          sample ? (
            <Link
              href={productPath(sample.code)}
              className="media-frame group relative block overflow-hidden rounded-lg border border-[var(--border)]"
            >
              <ProductImage
                product={sample}
                src={sample.imageUrl}
                alt=""
                className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                fallbackClassName="aspect-[4/5] w-full"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--accent)]">
                  Featured
                </p>
                <p className="mt-1 truncate font-[family-name:var(--font-oswald)] text-sm uppercase text-white">
                  {sample.displayName}
                </p>
              </div>
            </Link>
          ) : null
        }
      />
      <div className="page-shell py-10 lg:py-14">
        {audiences.length > 1 ? (
          <section className="mb-12 lg:mb-16">
            <SectionHeading title="Shop by athlete" href={`/shop/${slug}`} linkLabel="Shop all" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
              {audiences.map((g) => (
                <HubTile
                  key={g.key}
                  slug={slug}
                  name={g.name}
                  count={g.count}
                  href={g.href}
                  product={g.sample}
                  shape="square"
                />
              ))}
            </div>
          </section>
        ) : null}

        {shoeGroups.length > 0 ? (
          <section className="mb-12 lg:mb-16">
            <SectionHeading title="Shop by fit" href={`/shop/${slug}`} linkLabel="All shoes" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {shoeGroups.map((g) => (
                <HubTile
                  key={g.key}
                  slug={slug}
                  name={g.name}
                  count={g.count}
                  href={g.href}
                  product={g.sample}
                  banner={g.banner}
                  shape="square"
                />
              ))}
            </div>
          </section>
        ) : null}

        {rugbyGroups.length > 0 ? (
          <section className="mb-12 lg:mb-16">
            <SectionHeading title="Shop rugby" href="/shop/rugby" linkLabel="All rugby" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {rugbyGroups.map((g) => (
                <HubTile
                  key={g.key}
                  slug={slug}
                  name={g.name}
                  count={g.count}
                  href={g.href}
                  product={g.sample}
                  shape="square"
                />
              ))}
            </div>
          </section>
        ) : null}

        {bramaGroups.length > 0 ? (
          <section className="mb-12 lg:mb-16">
            <SectionHeading title="Shop Brama" href="/shop/brama" linkLabel="All Brama" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:gap-4">
              {bramaGroups.map((g) => (
                <HubTile
                  key={g.key}
                  slug={slug}
                  name={g.name}
                  count={g.count}
                  href={g.href}
                  product={g.sample}
                  shape="square"
                />
              ))}
            </div>
          </section>
        ) : null}

        {preview.length ? (
          <section>
            <SectionHeading
              title="In this hub"
              href={`/shop/${slug}`}
              linkLabel={
                items.length > preview.length
                  ? `View all ${items.length}`
                  : "View all"
              }
            />
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
              {preview.map((p) => (
                <ProductCard key={p.code} product={p} />
              ))}
            </div>
          </section>
        ) : (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
            <p className="font-[family-name:var(--font-oswald)] text-2xl uppercase text-ink">
              No stock in this hub yet
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted)]">
              {cat.name} is not in the current Joma drop. Shop sportswear or browse the
              full catalog.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/category/sportswear">Shop sportswear</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/search">Browse catalog</Link>
              </Button>
            </div>
          </section>
        )}

        {otherHubs.length ? (
          <nav className="mt-14 border-t border-[var(--border)] pt-8" aria-label="Other hubs">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-2)]">
              Other hubs
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {otherHubs.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="inline-flex min-h-10 items-center rounded-full border border-[var(--border-strong)] px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
