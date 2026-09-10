import { NextResponse } from "next/server";
import {
  DPO_TEST_AMOUNT,
  DPO_TEST_PRODUCT_CODE,
  DPO_TEST_PRODUCT_NAME,
  createToken,
  dpoCurrency,
  dpoPaymentUrl,
  splitName,
} from "@/lib/dpo";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { name?: string; email?: string };
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

  const companyRef = `DPO-TEST-${crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`;
  const { firstName, lastName } = splitName(name);
  const currency = dpoCurrency();

  let created;
  try {
    created = await createToken({
      companyRef,
      amount: DPO_TEST_AMOUNT,
      currency,
      description: `${DPO_TEST_PRODUCT_NAME} ${companyRef}`,
      customer: { firstName, lastName, email },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not start payment." },
      { status: 500 },
    );
  }

  if (created.result !== "000" || !created.transToken) {
    return NextResponse.json(
      { error: created.explanation ?? "DPO createToken failed." },
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
      amount: DPO_TEST_AMOUNT,
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
