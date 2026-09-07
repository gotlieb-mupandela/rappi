import { NextResponse } from "next/server";
import { buildCatalogIndex } from "@/lib/product-utils";
import { getCatalog } from "@/lib/supabase/catalog";

export const dynamic = "force-static";

export async function GET() {
  const catalog = await getCatalog();
  return NextResponse.json(buildCatalogIndex(catalog));
}
