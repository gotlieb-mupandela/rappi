import { fulfillDpoPayment } from "@/lib/dpo-payments";
import { xmlTag } from "@/lib/dpo";

export const runtime = "nodejs";

const OK_XML = `<?xml version="1.0" encoding="utf-8"?><API3G><Response>OK</Response></API3G>`;

export async function POST(req: Request) {
  const xml = await req.text();
  const transToken = xmlTag(xml, "TransactionToken") ?? xmlTag(xml, "TransToken");
  const companyRef = xmlTag(xml, "CompanyRef");

  if (transToken || companyRef) {
    try {
      await fulfillDpoPayment({ transToken, companyRef });
    } catch {
      // Always acknowledge so DPO does not retry a poison payload.
    }
  }

  return new Response(OK_XML, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
