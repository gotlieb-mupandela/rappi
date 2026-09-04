import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { products } from "@/lib/products";

export default function PromotionsPage() {
  const offers = products.filter((p) => p.badge === "offer");
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 lg:px-6">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Promotions" }]} />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-[family-name:var(--font-oswald)] text-4xl uppercase">
          Promotions [{offers.length}]
        </h1>
        <Button asChild variant="outline">
          <Link href="/search">Size guide — see product pages</Link>
        </Button>
      </div>
      {offers.length === 0 ? (
        <p className="mt-16 text-sm text-[#A0A0A0]">No promotions on this opening stock list.</p>
      ) : (
        <p className="mt-4 text-sm text-[#A0A0A0]">
          Highlighted opening-stock prices. Open search and filter Offer badges from product cards.
        </p>
      )}
    </div>
  );
}
