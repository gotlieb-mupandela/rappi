import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { DPO_TEST_AMOUNT, DPO_TEST_PRODUCT_NAME } from "@/lib/dpo-constants";
import { formatPrice } from "@/lib/format";
import { DpoTestForm } from "./dpo-test-form";

export const metadata: Metadata = {
  title: "DPO Test",
  robots: { index: false, follow: false },
};

export default function DpoTestPage() {
  return (
    <div className="page-shell py-8">
      <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "DPO Test" }]} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Sandbox only</p>
          <h1 className="mt-2 font-[family-name:var(--font-oswald)] text-3xl uppercase sm:text-4xl">
            {DPO_TEST_PRODUCT_NAME}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
            This page is for DPO Pay to verify Option A (createToken, hosted checkout, verifyToken).
            Shop checkout is unchanged. Do not use live cards.
          </p>
          <DpoTestForm />
        </section>
        <aside className="h-fit rounded-xl border border-[var(--accent)]/25 bg-[var(--surface)] p-5">
          <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[#10140c]">
            {/* SVG asset — next/image does not optimize local SVGs. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/dpo-test.svg" alt="DPO Test product" className="h-auto w-full" />
          </div>
          <h2 className="mt-5 text-sm font-bold uppercase tracking-wider">Test product</h2>
          <p className="mt-3 flex justify-between text-sm">
            <span>Code</span>
            <span>DPO-TEST</span>
          </p>
          <p className="flex justify-between text-lg font-semibold">
            <span>Amount</span>
            <span>{formatPrice(DPO_TEST_AMOUNT)}</span>
          </p>
          <ul className="mt-5 space-y-2 text-sm text-[var(--muted)]">
            <li>Test card expiry: 01/26</li>
            <li>If a mobile-money push appears, do not approve it. This is the test environment.</li>
            <li>After payment, DPO redirects here and we verify the token server-side.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
