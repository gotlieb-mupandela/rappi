import { NextResponse } from "next/server";
import {
  DPO_TEST_AMOUNT,
  DPO_TEST_PRODUCT_CODE,
  DPO_TEST_PRODUCT_NAME,
  createToken,
  dpoCurrency,
  dpoPaymentUrl,
  requestSiteUrl,
  splitName,
} from "@/lib/dpo";
import { shippingCostById, SHIPPING_METHODS } from "@/lib/shipping";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function parseQty(value: unknown) {
  const qty = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(qty) || qty < 1 || qty > 99) return null;
  return qty;
}

function parseShippingMethod(value: unknown) {
  const id = String(value ?? "pickup");
  return SHIPPING_METHODS.some((method) => method.id === id) ? id : null;
}

export async function POST(req: Request) {
  let body: {
    name?: string;
    email?: string;
    qty?: number;
    shippingMethod?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a name and a valid email." }, { status: 400 });
  }

  const qty = parseQty(body.qty) ?? 1;
  const shippingMethod = parseShippingMethod(body.shippingMethod) ?? "pickup";
  const shippingCost = shippingCostById(shippingMethod);
  const amount = DPO_TEST_AMOUNT * qty + shippingCost;

  const companyRef = `DPO-TEST-${crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
  const { firstName, lastName } = splitName(name);
  const currency = dpoCurrency();
  const description = `${DPO_TEST_PRODUCT_NAME} ×${qty} ${companyRef}`;

  let created;
  try {
    created = await createToken({
      companyRef,
      amount,
      currency,
      description,
      customer: { firstName, lastName, email },
      siteUrl: requestSiteUrl(req),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not start payment." },
      { status: 500 },
    );
  }

  if (created.result !== "000" || !created.transToken) {
    return NextResponse.json(
      {
        error:
          created.explanation ??
          `DPO createToken failed (${created.result ?? "no result"}).`,
      },
      { status: 400 },
    );
  }

  try {
    const admin = createAdminClient();
    const { error } = await admin.from("payments").insert({
      provider: "dpo",
      company_ref: companyRef,
      trans_token: created.transToken,
      trans_ref: created.transRef,
      product_code: DPO_TEST_PRODUCT_CODE,
      amount,
      currency,
      status: "pending",
      customer_email: email,
      customer_name: name,
    });
    if (error) {
      return NextResponse.json({ error: "Could not record payment." }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not record payment." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    paymentUrl: dpoPaymentUrl(created.transToken),
    companyRef,
    transToken: created.transToken,
  });
}
