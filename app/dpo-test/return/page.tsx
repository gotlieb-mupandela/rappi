import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ClearCartOnPaid } from "./clear-cart-on-paid";
import { fulfillDpoPayment } from "@/lib/dpo-payments";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "DPO Test return",
  robots: { index: false, follow: false },
};

export default async function DpoTestReturnPage({
  searchParams,
}: {
  searchParams: Promise<{
    TransactionToken?: string;
    TransToken?: string;
    CompanyRef?: string;
  }>;
}) {
  const params = await searchParams;
  const transToken = params.TransactionToken || params.TransToken || null;
  const companyRef = params.CompanyRef || null;

  let heading = "Payment not verified";
  let body = "Missing transaction token. Start again from the DPO Test product.";
  let paid = false;
  let ref: string | null = companyRef;
  let amount: string | null = null;

  if (transToken || companyRef) {
    try {
      const result = await fulfillDpoPayment({ transToken, companyRef });
      paid = result.ok && result.status === "paid";
      heading = paid ? "DPO Test paid" : "Payment not complete";
      body = result.message;
      ref = result.payment?.company_ref ?? companyRef;
      if (result.payment) {
        amount = formatPrice(Number(result.payment.amount));
      }
    } catch (err) {
      heading = "Payment not verified";
      body = err instanceof Error ? err.message : "Could not verify the DPO token.";
    }
  }

  return (
    <div className="page-shell py-8">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/product/DPO-TEST", label: "DPO Test" },
          { label: "Return" },
        ]}
      />
      <ClearCartOnPaid paid={paid} />
      <p className="mt-6 text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
        {paid ? "Verified" : "Sandbox"}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-oswald)] text-3xl uppercase sm:text-4xl">
        {heading}
      </h1>
      <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">{body}</p>
      {(ref || amount) && (
        <section className="mt-8 max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm">
          {ref && (
            <p className="flex justify-between gap-4">
              <span>Reference</span>
              <span className="break-all font-medium">{ref}</span>
            </p>
          )}
          {amount && (
            <p className="mt-2 flex justify-between">
              <span>Amount</span>
              <span className="font-semibold">{amount}</span>
            </p>
          )}
        </section>
      )}
      <Button asChild className="mt-8">
        <Link href="/product/DPO-TEST">{paid ? "Buy again" : "Back to DPO Test"}</Link>
      </Button>
    </div>
  );
}
